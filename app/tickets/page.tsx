import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { STATUS_COLOR, STATUS_LABEL, type TicketStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const me = await getSession();
  if (!me) return null;

  const where: any = { tenantId: me.tenantId };
  if (me.role === "TECHNICIAN") where.technicianId = me.id;

  const tickets = await prisma.ticket.findMany({
    where,
    include: { customer: true, device: true, technician: true },
    orderBy: { receivedAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Topbar title="Tickets" />
      <div className="p-4 sm:p-6">
        <div className="card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold">
              {me.role === "TECHNICIAN" ? "Mis tickets" : "Todos los tickets"}
            </h2>
            <span className="text-xs text-slate-500">
              {tickets.length} resultados
            </span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2">Folio</th>
                  <th className="text-left px-5 py-2">Cliente</th>
                  <th className="text-left px-5 py-2">Equipo</th>
                  <th className="text-left px-5 py-2">Técnico</th>
                  <th className="text-left px-5 py-2">Estado</th>
                  <th className="text-right px-5 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-mono text-xs">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="hover:text-brand-600"
                      >
                        {t.folio}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{t.customer.name}</td>
                    <td className="px-5 py-3">
                      {t.device.brand} {t.device.model}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {t.technician?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`pill ring-1 ${STATUS_COLOR[t.status as TicketStatus]}`}
                      >
                        {STATUS_LABEL[t.status as TicketStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      ${t.total.toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="block p-4 hover:bg-slate-50 active:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[11px] text-slate-500">
                      {t.folio}
                    </div>
                    <div className="font-medium text-sm truncate">
                      {t.device.brand} {t.device.model}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {t.customer.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.technician?.name ?? "Sin asignar"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`pill ring-1 ${STATUS_COLOR[t.status as TicketStatus]}`}
                    >
                      {STATUS_LABEL[t.status as TicketStatus]}
                    </span>
                    <div className="mt-1 text-sm font-semibold tabular-nums">
                      ${t.total.toLocaleString("es-MX")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              No hay tickets todavía.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
