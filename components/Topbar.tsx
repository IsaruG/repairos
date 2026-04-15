import { Search, Bell, Plus } from "lucide-react";
import Link from "next/link";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10 flex items-center px-6 gap-4">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Buscar folio, cliente, IMEI…"
        />
      </div>
      <button className="btn-ghost">
        <Bell className="h-4 w-4" />
      </button>
      <Link href="/recepcion" className="btn-primary">
        <Plus className="h-4 w-4" /> Nuevo ticket
      </Link>
    </header>
  );
}
