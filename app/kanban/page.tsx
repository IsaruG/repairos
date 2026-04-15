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
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar title="Kanban operativo" />
      <div className="flex-1 min-h-0 py-2 overflow-hidden">
        <KanbanBoard initialTickets={tickets} />
      </div>
    </div>
  );
}
