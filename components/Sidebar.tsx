import Link from "next/link";
import {
  LayoutDashboard,
  KanbanSquare,
  Inbox,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
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

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center text-white font-bold shadow-sm">
          🐯
        </div>
        <div className="ml-2.5">
          <div className="font-bold tracking-tight text-slate-900 leading-none">TigerFix</div>
          <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">repair os</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="font-medium text-slate-700">Sucursal Centro</div>
        <div>Egger Rojas · Admin</div>
      </div>
    </aside>
  );
}
