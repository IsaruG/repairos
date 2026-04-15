import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import KanbanBoard, { type KanbanTicket } from "@/components/KanbanBoard";
import type { TicketStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const rows = await prisma.ticket.findMany({
    include: { customer: true, device: true, technician: true },
    orderBy: { receivedAt: "desc" },
  });

  const tickets: KanbanTicket[] = rows.map((t) => ({
    id: t.id,
    folio: t.folio,
    status: t.status as TicketStatus,
    reportedIssue: t.reportedIssue,
    total: t.total,
    receivedAt: t.receivedAt.toISOString(),
    customerName: t.customer.name,
    deviceLabel: `${t.device.brand} ${t.device.model}`,
    technicianName: t.technician?.name ?? null,
    slaDueAt: t.slaDueAt ? t.slaDueAt.toISOString() : null,
  }));

  return (
    <>
      <Topbar title="Kanban operativo" />
      <div className="py-4 sm:py-6 overflow-x-auto">
        <KanbanBoard initialTickets={tickets} />
      </div>
      <p className="px-4 sm:px-6 pb-6 text-[11px] text-slate-400 sm:hidden">
        Mantén presionado una tarjeta para arrastrar.
      </p>
    </>
  );
}
