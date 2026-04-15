import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { STATUS_COLOR, STATUS_LABEL, type TicketStatus } from "@/lib/status";
import Link from "next/link";
import { TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const [inProcess, delivered, tickets] = await Promise.all([
    prisma.ticket.count({
      where: { status: { in: ["NEW", "DIAGNOSIS", "QUOTED", "REPAIRING", "READY"] } },
    }),
    prisma.ticket.count({ where: { status: "DELIVERED" } }),
    prisma.ticket.findMany({
      take: 8,
      orderBy: { receivedAt: "desc" },
      include: { customer: true, device: true },
    }),
  ]);
  const payments = await prisma.payment.aggregate({ _sum: { amount: true } });
  const revenue = payments._sum.amount ?? 0;

  return { inProcess, delivered, revenue, tickets };
}

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: any;
  tone: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
            {label}
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {delta && (
            <div className="mt-1 text-[10px] sm:text-xs text-emerald-600">
              {delta}
            </div>
          )}
        </div>
        <div
          className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg grid place-items-center shrink-0 ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const m = await getMetrics();

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Kpi
            label="Equipos en proceso"
            value={String(m.inProcess)}
            delta="+12% vs ayer"
            icon={Clock}
            tone="bg-blue-50 text-blue-600"
          />
          <Kpi
            label="Ingresos acumulados"
            value={`$${m.revenue.toLocaleString("es-MX")}`}
            delta="+8% vs sem. pasada"
            icon={TrendingUp}
            tone="bg-emerald-50 text-emerald-600"
          />
          <Kpi
            label="Entregados"
            value={String(m.delivered)}
            delta="+15%"
            icon={CheckCircle2}
            tone="bg-teal-50 text-teal-600"
          />
          <Kpi
            label="Atrasados"
            value="4"
            icon={AlertTriangle}
            tone="bg-red-50 text-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Ingresos últimos 30 días</h2>
              <span className="text-xs text-slate-500">Demo chart</span>
            </div>
            <svg viewBox="0 0 600 180" className="w-full h-40">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,120 C60,80 120,140 180,90 C240,40 300,110 360,70 C420,30 480,100 540,50 L600,60 L600,180 L0,180 Z"
                fill="url(#g1)"
              />
              <path
                d="M0,120 C60,80 120,140 180,90 C240,40 300,110 360,70 C420,30 480,100 540,50 L600,60"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Alertas inteligentes</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                4 equipos superaron SLA
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                3 cotizaciones sin respuesta &gt;48h
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                Luis: +20% productividad esta semana
              </li>
            </ul>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold">Tickets recientes</h2>
            <Link
              href="/kanban"
              className="text-sm text-brand-600 hover:underline"
            >
              Ver kanban →
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2">Folio</th>
                  <th className="text-left px-5 py-2">Cliente</th>
                  <th className="text-left px-5 py-2">Equipo</th>
                  <th className="text-left px-5 py-2">Estado</th>
                  <th className="text-right px-5 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {m.tickets.map((t) => (
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

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {m.tickets.map((t) => (
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
        </div>
      </div>
    </>
  );
}
