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
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";

type Role = "CLIENT" | "TECHNICIAN" | "RECEPTION" | "ADMIN";
const ROLE_ORDER: Role[] = ["CLIENT", "TECHNICIAN", "RECEPTION", "ADMIN"];

function hasRole(role: Role, min: Role) {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min);
}

const ROLE_LABEL: Record<Role, string> = {
  CLIENT: "Cliente",
  TECHNICIAN: "Técnico",
  RECEPTION: "Recepción",
  ADMIN: "Administrador",
};

const items: {
  href: string;
  label: string;
  icon: any;
  minRole: Role;
}[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, minRole: "TECHNICIAN" },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare, minRole: "TECHNICIAN" },
  { href: "/recepcion", label: "Recepción", icon: Inbox, minRole: "RECEPTION" },
  { href: "/tickets", label: "Tickets", icon: Wrench, minRole: "TECHNICIAN" },
  { href: "/pagos", label: "Pagos", icon: DollarSign, minRole: "RECEPTION" },
  { href: "/reportes", label: "Reportes", icon: BarChart3, minRole: "ADMIN" },
  { href: "/ajustes", label: "Ajustes", icon: Settings, minRole: "TECHNICIAN" },
];

type SessionUser = {
  name: string;
  email: string;
  role: Role;
};

function SidebarBody({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleItems = items.filter((it) => hasRole(user.role, it.minRole));

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
        {visibleItems.map((it) => {
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

      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="px-2 py-2">
          <div className="font-medium text-slate-800 text-sm truncate">
            {user.name}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {user.email}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            {ROLE_LABEL[user.role]}
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-slate-200 bg-white sticky top-0 h-screen">
        <SidebarBody user={user} />
      </aside>

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
          className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-slate-100 grid place-items-center z-10"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarBody user={user} onNavigate={() => setOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
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
