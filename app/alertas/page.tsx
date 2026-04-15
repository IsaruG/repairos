import Topbar from "@/components/Topbar";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { computeAlerts } from "@/lib/modules/alerts/service";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const TONES = {
  critical: "text-red-600 bg-red-50 border-red-100",
  warning: "text-amber-600 bg-amber-50 border-amber-100",
  info: "text-blue-600 bg-blue-50 border-blue-100",
};
const LABELS = { critical: "Crítica", warning: "Advertencia", info: "Aviso" };

export default async function AlertasPage() {
  const me = await getSession();
  if (!me) return null;
  const alerts = await computeAlerts(me);

  const groups = {
    critical: alerts.filter((a) => a.severity === "critical"),
    warning: alerts.filter((a) => a.severity === "warning"),
    info: alerts.filter((a) => a.severity === "info"),
  };

  return (
    <>
      <Topbar title="Alertas" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl">
        <div className="grid grid-cols-3 gap-3">
          {(["critical", "warning", "info"] as const).map((k) => {
            const Icon = ICONS[k];
            return (
              <div key={k} className={`card p-4 border ${TONES[k]}`}>
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5" />
                  <span className="text-2xl font-bold tabular-nums">
                    {groups[k].length}
                  </span>
                </div>
                <div className="text-xs mt-1 font-medium">{LABELS[k]}</div>
              </div>
            );
          })}
        </div>

        {alerts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="font-semibold">Sin alertas activas</div>
            <div className="text-sm text-slate-500 mt-1">
              Todos los tickets y el stock están en orden.
            </div>
          </div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {alerts.map((a) => {
              const Icon = ICONS[a.severity];
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${TONES[a.severity]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {a.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {a.description}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">
                    {LABELS[a.severity]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
