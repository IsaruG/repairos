import { Plus } from "lucide-react";
import Link from "next/link";
import GlobalSearch from "./GlobalSearch";
import AlertsBell from "./AlertsBell";
import { getSession } from "@/lib/auth";
import { computeAlerts } from "@/lib/modules/alerts/service";

export default async function Topbar({ title }: { title: string }) {
  const me = await getSession();
  const alerts = me ? await computeAlerts(me) : [];

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 sm:px-6 gap-2 sm:gap-4">
      <div className="lg:hidden w-10 shrink-0" aria-hidden />

      <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
        {title}
      </h1>

      <GlobalSearch />

      <AlertsBell alerts={alerts} />

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
