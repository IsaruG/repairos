"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Inbox,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/recepcion", label: "Recepción", icon: Inbox },
  { href: "/tickets", label: "Tickets", icon: Wrench },
  { href: "/pagos", label: "Pagos", icon: DollarSign },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-100 shrink-0">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-white font-bold shadow-sm text-lg">
          🐯
        </div>
        <div className="ml-2.5">
          <div className="font-bold tracking-tight text-slate-900 leading-none">
            TigerFix
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
            repair os
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500 shrink-0">
        <div className="font-medium text-slate-700">Sucursal Centro</div>
        <div>Egger Rojas · Admin</div>
      </div>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-slate-200 bg-white sticky top-0 h-screen">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-slate-100 grid place-items-center"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarBody onNavigate={() => setOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile burger button (floating anchor consumed by Topbar via context would be cleaner, but we inject inline) */}
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-30 h-10 w-10 rounded-lg bg-white border border-slate-200 shadow-card grid place-items-center"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        {children}
      </main>
    </div>
  );
}
