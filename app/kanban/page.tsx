import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { KANBAN_ORDER, STATUS_COLOR, STATUS_LABEL } from "@/lib/status";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const tickets = await prisma.ticket.findMany({
    include: { customer: true, device: true, technician: true },
    orderBy: { receivedAt: "desc" },
  });

  const groups = Object.fromEntries(
    KANBAN_ORDER.map((s) => [s, tickets.filter((t) => t.status === s)])
  );

  return (
    <>
      <Topbar title="Kanban operativo" />
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {KANBAN_ORDER.map((status) => (
            <div key={status} className="w-72 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`pill ring-1 ${STATUS_COLOR[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {groups[status].length}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {groups[status].map((t) => (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    className="block card p-3 hover:ring-2 hover:ring-brand-500/30 transition-all"
                  >
                    <div className="font-mono text-[11px] text-slate-500">
                      {t.folio}
                    </div>
                    <div className="mt-1 font-medium text-sm truncate">
                      {t.device.brand} {t.device.model}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 truncate">
                      {t.customer.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {t.technician?.name ?? "—"}
                      </span>
                      <span className="text-xs font-semibold">
                        ${t.total.toLocaleString("es-MX")}
                      </span>
                    </div>
                  </Link>
                ))}
                {groups[status].length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    Sin tickets
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
