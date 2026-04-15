import { Search, Bell, Plus } from "lucide-react";
import Link from "next/link";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 sm:px-6 gap-2 sm:gap-4">
      {/* Spacer for mobile burger button */}
      <div className="lg:hidden w-10 shrink-0" aria-hidden />

      <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
        {title}
      </h1>

      {/* Search: hidden on xs, inline on sm+ */}
      <div className="hidden sm:flex flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Buscar folio, cliente, IMEI…"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <button
        className="btn-ghost hidden sm:inline-flex"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4" />
      </button>

      <Link
        href="/recepcion"
        className="btn-primary px-3 sm:px-4"
        aria-label="Nuevo ticket"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo ticket</span>
      </Link>
    </header>
  );
}
