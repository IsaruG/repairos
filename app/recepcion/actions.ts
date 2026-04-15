"use server";

import { prisma } from "@/lib/db";
import { generateFolio } from "@/lib/folio";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const schema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  brand: z.string().min(1),
  model: z.string().min(1),
  imei: z.string().optional(),
  color: z.string().optional(),
  reportedIssue: z.string().min(3),
});

export async function createTicket(formData: FormData) {
  const data = schema.parse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    brand: formData.get("brand"),
    model: formData.get("model"),
    imei: formData.get("imei") ?? "",
    color: formData.get("color") ?? "",
    reportedIssue: formData.get("reportedIssue"),
  });

  const tenant = await prisma.tenant.findFirst();
  const branch = await prisma.branch.findFirst({
    where: { tenantId: tenant?.id },
  });
  if (!tenant || !branch) {
    throw new Error("Seed pendiente: ejecuta `npm run db:seed`.");
  }

  const existing = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, phone: data.phone },
  });

  const customer =
    existing ??
    (await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: data.customerName,
        phone: data.phone,
        email: data.email || null,
      },
    }));

  const device = await prisma.device.create({
    data: {
      customerId: customer.id,
      brand: data.brand,
      model: data.model,
      imei: data.imei || null,
      color: data.color || null,
    },
  });

  const folio = await generateFolio("CDMX");

  const ticket = await prisma.ticket.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      folio,
      customerId: customer.id,
      deviceId: device.id,
      reportedIssue: data.reportedIssue,
      status: "NEW",
    },
  });

  await prisma.activity.create({
    data: {
      ticketId: ticket.id,
      type: "status_change",
      payload: JSON.stringify({ from: null, to: "NEW" }),
    },
  });

  revalidatePath("/");
  revalidatePath("/kanban");
  redirect(`/tickets/${ticket.id}`);
}
