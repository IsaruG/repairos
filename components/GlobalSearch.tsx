"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Wrench,
  User,
  Smartphone,
  Shield,
  Loader2,
  Command,
} from "lucide-react";

type Hit = {
  kind: "ticket" | "customer" | "device" | "user";
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  score: number;
};

type SearchResult = {
  query: string;
  total: number;
  groups: {
    tickets: Hit[];
    customers: Hit[];
    devices: Hit[];
    users: Hit[];
  };
};

const EMPTY: SearchResult = {
  query: "",
  total: 0,
  groups: { tickets: [], customers: [], devices: [], users: [] },
};

const ICONS = {
  ticket: Wrench,
  customer: User,
  device: Smartphone,
  user: Shield,
};

const GROUP_LABELS = {
  ticket: "Tickets",
  customer: "Clientes",
  device: "Equipos",
  user: "Usuarios",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const tokens = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return <>{text}</>;

  const normText = normalize(text);
  const marks: { start: number; end: number }[] = [];
  for (const t of tokens) {
    let idx = 0;
    while ((idx = normText.indexOf(t, idx)) !== -1) {
      marks.push({ start: idx, end: idx + t.length });
      idx += t.length;
    }
  }
  if (marks.length === 0) return <>{text}</>;

  marks.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const m of marks) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) last.end = Math.max(last.end, m.end);
    else merged.push({ ...m });
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < merged.length; i++) {
    const m = merged[i];
    if (cursor < m.start) parts.push(text.slice(cursor, m.start));
    parts.push(
      <mark
        key={i}
        className="bg-amber-200 text-slate-900 rounded px-0.5 py-0"
      >
        {text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult>(EMPTY);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Flatten for keyboard nav
  const flat = useMemo(() => {
    return [
      ...result.groups.tickets,
      ...result.groups.customers,
      ...result.groups.devices,
      ...result.groups.users,
    ];
  }, [result]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResult(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as SearchResult;
      setResult(data);
      setActiveIdx(0);
    } catch {
      setResult(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 150);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQuery("");
      setResult(EMPTY);
      setActiveIdx(0);
    }
  }, [open]);

  // Keep active item in view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${activeIdx}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      const hit = flat[activeIdx];
      if (hit) {
        router.push(hit.href);
        setOpen(false);
      }
    }
  }

  function renderGroup(kind: keyof typeof GROUP_LABELS, items: Hit[]) {
    if (items.length === 0) return null;
    const Icon = ICONS[kind];
    return (
      <div key={kind} className="py-2">
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {GROUP_LABELS[kind]}
        </div>
        {items.map((hit) => {
          const idx = flat.findIndex(
            (h) => h.kind === hit.kind && h.id === hit.id
          );
          const active = idx === activeIdx;
          return (
            <button
              key={`${hit.kind}-${hit.id}`}
              data-idx={idx}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => {
                router.push(hit.href);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                active ? "bg-brand-50" : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${
                  active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 truncate">
                  <Highlight text={hit.title} query={query} />
                </div>
                <div className="text-xs text-slate-500 truncate">
                  <Highlight text={hit.subtitle} query={query} />
                </div>
              </div>
              {hit.meta && (
                <div className="text-[10px] text-slate-400 uppercase shrink-0">
                  <Highlight text={hit.meta} query={query} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Trigger button (replaces the static input) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex flex-1 max-w-md mx-auto items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
        aria-label="Abrir búsqueda"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar folio, cliente, IMEI…</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] text-slate-400 font-mono border border-slate-200 rounded px-1 py-0.5">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Mobile trigger: icon only */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden btn-ghost"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl card overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 border-b border-slate-100">
              {loading ? (
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-slate-400" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Folio, IMEI, cliente, teléfono, equipo…"
                className="flex-1 py-4 text-sm outline-none bg-transparent placeholder:text-slate-400"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="text-[10px] text-slate-400 font-mono border border-slate-200 rounded px-1.5 py-0.5">
                Esc
              </kbd>
            </div>

            <div
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto"
            >
              {query && result.total === 0 && !loading && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Sin resultados para{" "}
                  <span className="font-medium text-slate-700">"{query}"</span>
                </div>
              )}

              {!query && (
                <div className="p-6 text-sm text-slate-500 space-y-2">
                  <div className="font-medium text-slate-700">
                    Búsqueda inteligente
                  </div>
                  <ul className="space-y-1 text-xs">
                    <li>• Folio completo o parcial (ej. <span className="font-mono">0003</span>)</li>
                    <li>• IMEI del equipo</li>
                    <li>• Nombre o teléfono del cliente</li>
                    <li>• Marca, modelo, color del equipo</li>
                    <li>• Descripción del problema o diagnóstico</li>
                  </ul>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Tolerante a acentos y multi-palabra.
                  </div>
                </div>
              )}

              {renderGroup("ticket", result.groups.tickets)}
              {renderGroup("customer", result.groups.customers)}
              {renderGroup("device", result.groups.devices)}
              {renderGroup("user", result.groups.users)}
            </div>

            <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="font-mono">↑↓</kbd> navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono">↵</kbd> abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono">esc</kbd> cerrar
              </span>
              <span className="ml-auto">
                {result.total} resultado{result.total !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
