"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";

type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  href: string;
};

const ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

const DOT_TONES = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

export default function AlertsBell({ alerts }: { alerts: Alert[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const count = alerts.length;
  const critical = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost relative"
        aria-label={`${count} alertas`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white grid place-items-center ${
              critical > 0 ? "bg-red-500" : "bg-amber-500"
            }`}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(90vw,360px)] card overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Alertas</div>
              <div className="text-[11px] text-slate-500">
                {count === 0 ? "Todo en orden" : `${count} pendientes`}
              </div>
            </div>
            <Link
              href="/alertas"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
            {alerts.slice(0, 10).map((a) => {
              const Icon = ICONS[a.severity];
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className={`mt-0.5 shrink-0 ${TONES[a.severity]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {a.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {a.description}
                    </div>
                  </div>
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${DOT_TONES[a.severity]}`}
                  />
                </Link>
              );
            })}
            {count === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                Sin alertas activas 🎉
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
