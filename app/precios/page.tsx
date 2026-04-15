import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Smartphone, Battery, Code2, Search, Wrench, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<
  string,
  { label: string; icon: any; tone: string }
> = {
  screen: { label: "Pantallas", icon: Smartphone, tone: "bg-blue-50 text-blue-600" },
  battery: { label: "Baterías", icon: Battery, tone: "bg-emerald-50 text-emerald-600" },
  software: { label: "Software", icon: Code2, tone: "bg-violet-50 text-violet-600" },
  diagnostic: { label: "Diagnóstico", icon: Search, tone: "bg-amber-50 text-amber-600" },
  general: { label: "General", icon: Wrench, tone: "bg-slate-100 text-slate-600" },
};

export default async function PreciosPage() {
  const me = await getSession();
  if (!me) return null;

  const services = await prisma.service.findMany({
    where: { tenantId: me.tenantId, active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped: Record<string, typeof services> = {};
  for (const s of services) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  return (
    <>
      <Topbar title="Lista de precios" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">
        <div className="text-sm text-slate-500">
          Catálogo de servicios disponibles · {services.length} en total
        </div>

        {Object.entries(grouped).map(([cat, items]) => {
          const meta = CATEGORY_META[cat] ?? CATEGORY_META.general;
          const Icon = meta.icon;
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`h-8 w-8 rounded-lg grid place-items-center ${meta.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-semibold">{meta.label}</h2>
                <span className="text-xs text-slate-500">
                  ({items.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="card p-4 hover:ring-2 hover:ring-brand-500/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{s.name}</div>
                        {s.description && (
                          <div className="text-xs text-slate-500 mt-1">
                            {s.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          {s.durationMin} min
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {s.price > 0 ? (
                          <div className="text-lg font-bold tabular-nums">
                            ${s.price.toLocaleString("es-MX")}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic">
                            A cotizar
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {services.length === 0 && (
          <div className="card p-12 text-center text-sm text-slate-500">
            Sin servicios registrados.
          </div>
        )}
      </div>
    </>
  );
}
