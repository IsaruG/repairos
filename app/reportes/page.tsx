import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { getSession, hasRole } from "@/lib/auth";
import { STATUS_LABEL, type TicketStatus } from "@/lib/status";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const me = await getSession();
  if (!me) return null;

  if (!hasRole(me, "ADMIN")) {
    return (
      <>
        <Topbar title="Reportes" />
        <div className="p-6 grid place-items-center min-h-[60vh]">
          <div className="card p-8 text-center max-w-sm">
            <Lock className="h-8 w-8 mx-auto text-slate-400 mb-3" />
            <h2 className="font-semibold mb-1">Acceso restringido</h2>
            <p className="text-sm text-slate-500">
              Esta sección es solo para administradores.
            </p>
          </div>
        </div>
      </>
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: { tenantId: me.tenantId },
    include: { technician: true, payments: true },
  });

  const byStatus: Record<string, number> = {};
  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  }

  const byTech: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const t of tickets) {
    const name = t.technician?.name ?? "Sin asignar";
    const revenue = t.payments.reduce((s, p) => s + p.amount, 0);
    if (!byTech[name]) byTech[name] = { name, count: 0, revenue: 0 };
    byTech[name].count += 1;
    byTech[name].revenue += revenue;
  }

  const delivered = tickets.filter((t) => t.status === "DELIVERED");
  const tatHours =
    delivered.length > 0
      ? delivered
          .filter((t) => t.deliveredAt)
          .reduce(
            (s, t) =>
              s +
              (t.deliveredAt!.getTime() - t.receivedAt.getTime()) /
                (1000 * 60 * 60),
            0
          ) / delivered.length
      : 0;

  const totalRevenue = tickets
    .flatMap((t) => t.payments)
    .filter((p) => p.type !== "REFUND")
    .reduce((s, p) => s + p.amount, 0);

  const avgTicket =
    tickets.length > 0
      ? tickets.reduce((s, t) => s + t.total, 0) / tickets.length
      : 0;

  return (
    <>
      <Topbar title="Reportes" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Total tickets
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              {tickets.length}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Ingresos
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              ${totalRevenue.toLocaleString("es-MX")}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Ticket promedio
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              ${Math.round(avgTicket).toLocaleString("es-MX")}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              TAT promedio
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              {tatHours > 0 ? `${tatHours.toFixed(1)}h` : "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Tickets por estado</h2>
            <div className="space-y-3">
              {Object.entries(byStatus).map(([status, count]) => {
                const pct = (count / Math.max(1, tickets.length)) * 100;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">
                        {STATUS_LABEL[status as TicketStatus] ?? status}
                      </span>
                      <span className="font-medium tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Ingresos por técnico</h2>
            <div className="space-y-3">
              {Object.values(byTech).map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.count} tickets
                    </div>
                  </div>
                  <div className="font-semibold tabular-nums">
                    ${t.revenue.toLocaleString("es-MX")}
                  </div>
                </div>
              ))}
              {Object.values(byTech).length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">
                  Sin datos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
