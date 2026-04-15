import { prisma } from "@/lib/db";
import { verifyFolio } from "@/lib/modules/portal/token";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  Wrench,
  Search,
  PackageCheck,
  HandCoins,
  PhoneCall,
  MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "NEW", label: "Recibido", icon: Package },
  { key: "DIAGNOSIS", label: "Diagnóstico", icon: Search },
  { key: "QUOTED", label: "Cotización", icon: HandCoins },
  { key: "REPAIRING", label: "En reparación", icon: Wrench },
  { key: "READY", label: "Listo", icon: PackageCheck },
  { key: "DELIVERED", label: "Entregado", icon: CheckCircle2 },
];

function stepIndex(status: string): number {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default async function PortalPage({
  params,
}: {
  params: { folio: string; token: string };
}) {
  const folio = decodeURIComponent(params.folio);
  if (!verifyFolio(folio, params.token)) return notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { folio },
    include: {
      customer: true,
      device: true,
      technician: true,
      payments: true,
    },
  });

  if (!ticket) return notFound();

  const current = stepIndex(ticket.status);
  const paid = ticket.payments.reduce((s, p) => s + p.amount, 0);
  const pending = ticket.total - paid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-white text-lg shadow-sm">
            🐯
          </div>
          <div>
            <div className="font-bold leading-none tracking-tight">
              TigerFix
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              Portal del cliente
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <section className="card p-5 sm:p-6">
          <div className="font-mono text-[11px] text-slate-500">
            {ticket.folio}
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
            {ticket.device.brand} {ticket.device.model}
          </h1>
          <div className="text-sm text-slate-600 mt-0.5">
            Hola, {ticket.customer.name} — así va tu reparación.
          </div>
        </section>

        {/* Interactive timeline */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" /> Progreso
          </h2>
          <ol className="relative">
            {STEPS.map((s, i) => {
              const done = i < current;
              const active = i === current;
              const Icon = s.icon;
              return (
                <li
                  key={s.key}
                  className="flex gap-3 pb-5 last:pb-0 relative"
                >
                  {i < STEPS.length - 1 && (
                    <span
                      className={`absolute left-[18px] top-10 bottom-0 w-0.5 ${
                        done ? "bg-brand-500" : "bg-slate-200"
                      }`}
                      aria-hidden
                    />
                  )}
                  <div
                    className={`relative h-9 w-9 rounded-full grid place-items-center shrink-0 transition-all ${
                      done
                        ? "bg-brand-500 text-white"
                        : active
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-4 ring-amber-200 animate-pulse"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div
                      className={`text-sm font-medium ${
                        active ? "text-slate-900" : done ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </div>
                    {active && (
                      <div className="text-xs text-brand-700 mt-0.5">
                        ⚡ Estado actual
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Cost summary */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold mb-4">Resumen económico</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Mano de obra</span>
              <span className="font-medium tabular-nums">
                ${ticket.laborCost.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Refacciones</span>
              <span className="font-medium tabular-nums">
                ${ticket.partsCost.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="font-semibold">Total</span>
              <span className="font-semibold tabular-nums">
                ${ticket.total.toLocaleString("es-MX")}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Pagado</span>
              <span className="tabular-nums">
                ${paid.toLocaleString("es-MX")}
              </span>
            </div>
            {pending > 0 ? (
              <div className="flex justify-between text-orange-600 pt-2 border-t border-slate-100">
                <span className="font-semibold">Por pagar</span>
                <span className="font-bold tabular-nums">
                  ${pending.toLocaleString("es-MX")}
                </span>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 text-emerald-600 text-xs font-medium">
                ✓ Pago completo
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold mb-3">¿Dudas? Contáctanos</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/5215512345678?text=${encodeURIComponent(
                `Hola, tengo una duda sobre mi ticket ${ticket.folio}`
              )}`}
              target="_blank"
              rel="noopener"
              className="btn bg-emerald-500 text-white hover:bg-emerald-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href="tel:+525512345678"
              className="btn-ghost border border-slate-200"
            >
              <PhoneCall className="h-4 w-4" /> Llamar
            </a>
          </div>
        </section>

        <footer className="text-center text-[11px] text-slate-400 pt-4">
          Powered by TigerFix · Este enlace es único y personal.
        </footer>
      </main>
    </div>
  );
}
