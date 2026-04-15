"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ALLOWED_STATUSES = [
  "NEW",
  "DIAGNOSIS",
  "QUOTED",
  "APPROVED",
  "REPAIRING",
  "READY",
  "DELIVERED",
  "ISSUE",
] as const;

const schema = z.object({
  ticketId: z.string().cuid(),
  newStatus: z.enum(ALLOWED_STATUSES),
});

export type MoveResult =
  | { ok: true; ticketId: string; newStatus: string }
  | { ok: false; error: string };

export async function moveTicket(
  ticketId: string,
  newStatus: string
): Promise<MoveResult> {
  const parsed = schema.safeParse({ ticketId, newStatus });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  // TODO (auth): resolve current tenantId from session, enforce ticket.tenantId match
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) return { ok: false, error: "No tenant" };

  const ticket = await prisma.ticket.findUnique({
    where: { id: parsed.data.ticketId },
    select: { id: true, tenantId: true, status: true },
  });
  if (!ticket || ticket.tenantId !== tenant.id) {
    return { ok: false, error: "Not found" };
  }

  if (ticket.status === parsed.data.newStatus) {
    return { ok: true, ticketId: ticket.id, newStatus: ticket.status };
  }

  // Simple FSM guard: block jumping back from DELIVERED unless flagging issue
  if (ticket.status === "DELIVERED" && parsed.data.newStatus !== "ISSUE") {
    return { ok: false, error: "No se puede mover un ticket entregado" };
  }

  const now = new Date();
  const extra: Record<string, unknown> = {};
  if (parsed.data.newStatus === "REPAIRING") extra.startedAt = now;
  if (parsed.data.newStatus === "READY") extra.finishedAt = now;
  if (parsed.data.newStatus === "DELIVERED") extra.deliveredAt = now;

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: parsed.data.newStatus, ...extra },
    }),
    prisma.activity.create({
      data: {
        ticketId: ticket.id,
        type: "status_change",
        payload: JSON.stringify({
          from: ticket.status,
          to: parsed.data.newStatus,
        }),
      },
    }),
  ]);

  revalidatePath("/kanban");
  revalidatePath("/");
  revalidatePath(`/tickets/${ticket.id}`);

  return { ok: true, ticketId: ticket.id, newStatus: parsed.data.newStatus };
}
