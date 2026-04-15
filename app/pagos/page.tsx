import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  DEPOSIT: "Anticipo",
  FINAL: "Pago final",
  REFUND: "Reembolso",
};

const TYPE_TONE: Record<string, string> = {
  DEPOSIT: "bg-blue-50 text-blue-700 ring-blue-200",
  FINAL: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REFUND: "bg-red-50 text-red-700 ring-red-200",
};

export default async function PagosPage() {
  const me = await getSession();
  if (!me) return null;

  const payments = await prisma.payment.findMany({
    where: { ticket: { tenantId: me.tenantId } },
    include: { ticket: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = payments
    .filter((p) => p.type !== "REFUND")
    .reduce((s, p) => s + p.amount, 0);
  const deposits = payments.filter((p) => p.type === "DEPOSIT").length;
  const finals = payments.filter((p) => p.type === "FINAL").length;

  return (
    <>
      <Topbar title="Pagos" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Total cobrado
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              ${total.toLocaleString("es-MX")}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Anticipos
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              {deposits}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs text-slate-500">
              Pagos finales
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
              {finals}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h2 className="font-semibold">Movimientos recientes</h2>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2">Fecha</th>
                  <th className="text-left px-5 py-2">Folio</th>
                  <th className="text-left px-5 py-2">Cliente</th>
                  <th className="text-left px-5 py-2">Tipo</th>
                  <th className="text-left px-5 py-2">Método</th>
                  <th className="text-right px-5 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {p.createdAt.toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      <Link
                        href={`/tickets/${p.ticketId}`}
                        className="hover:text-brand-600"
                      >
                        {p.ticket.folio}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{p.ticket.customer.name}</td>
                    <td className="px-5 py-3">
                      <span className={`pill ring-1 ${TYPE_TONE[p.type]}`}>
                        {TYPE_LABEL[p.type]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 capitalize">
                      {p.method}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      ${p.amount.toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {payments.map((p) => (
              <Link
                key={p.id}
                href={`/tickets/${p.ticketId}`}
                className="block p-4 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[11px] text-slate-500">
                      {p.ticket.folio}
                    </div>
                    <div className="font-medium text-sm truncate">
                      {p.ticket.customer.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 capitalize">
                      {p.createdAt.toLocaleDateString("es-MX")} · {p.method}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`pill ring-1 ${TYPE_TONE[p.type]}`}>
                      {TYPE_LABEL[p.type]}
                    </span>
                    <div className="mt-1 text-sm font-semibold tabular-nums">
                      ${p.amount.toLocaleString("es-MX")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              Sin pagos registrados.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
