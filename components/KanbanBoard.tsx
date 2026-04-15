"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import Link from "next/link";
import { AlertTriangle, Clock, User } from "lucide-react";
import {
  KANBAN_ORDER,
  STATUS_COLOR,
  STATUS_LABEL,
  type TicketStatus,
} from "@/lib/status";
import { moveTicket } from "@/app/kanban/actions";

export type KanbanTicket = {
  id: string;
  folio: string;
  status: TicketStatus;
  reportedIssue: string;
  total: number;
  receivedAt: string;
  customerName: string;
  deviceLabel: string;
  technicianName: string | null;
  slaDueAt: string | null;
};

function slaState(due: string | null): "ok" | "warn" | "late" | null {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  if (ms < 0) return "late";
  if (ms < 1000 * 60 * 60 * 4) return "warn";
  return "ok";
}

function TicketCard({
  ticket,
  overlay = false,
}: {
  ticket: KanbanTicket;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket },
  });

  const sla = slaState(ticket.slaDueAt);
  const slaTone =
    sla === "late"
      ? "text-red-600"
      : sla === "warn"
        ? "text-amber-600"
        : "text-emerald-600";

  const baseClass =
    "card p-3 select-none transition-all hover:ring-2 hover:ring-brand-500/30";
  const draggingClass = isDragging ? "opacity-30" : "";
  const overlayClass = overlay ? "rotate-2 shadow-2xl ring-2 ring-brand-500/40" : "";

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={`${baseClass} ${draggingClass} ${overlayClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono text-[10px] text-slate-500">
          {ticket.folio}
        </div>
        {sla && (
          <div className={`flex items-center gap-0.5 text-[10px] ${slaTone}`}>
            {sla === "late" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            SLA
          </div>
        )}
      </div>
      <div className="mt-1 font-medium text-sm truncate">
        {ticket.deviceLabel}
      </div>
      <div className="text-xs text-slate-600 truncate">
        {ticket.customerName}
      </div>
      <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">
        {ticket.reportedIssue}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <User className="h-3 w-3" />
          {ticket.technicianName ?? "Sin asignar"}
        </div>
        <span className="text-xs font-semibold tabular-nums">
          ${ticket.total.toLocaleString("es-MX")}
        </span>
      </div>
      {!overlay && (
        <Link
          href={`/tickets/${ticket.id}`}
          className="block text-[10px] text-brand-600 mt-1.5 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Abrir →
        </Link>
      )}
    </div>
  );
}

function Column({
  status,
  tickets,
  totalAmount,
}: {
  status: TicketStatus;
  tickets: KanbanTicket[];
  totalAmount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div className="w-[85vw] max-w-[320px] sm:w-72 shrink-0 flex flex-col snap-center sm:snap-start">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`pill ring-1 ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
          <span className="text-xs text-slate-500">{tickets.length}</span>
        </div>
        <span className="text-[11px] text-slate-500 tabular-nums">
          ${totalAmount.toLocaleString("es-MX")}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-xl p-2 transition-colors min-h-[200px] ${
          isOver ? "bg-brand-50 ring-2 ring-brand-500/30" : ""
        }`}
      >
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {tickets.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  initialTickets,
}: {
  initialTickets: KanbanTicket[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [active, setActive] = useState<KanbanTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor)
  );

  function handleStart(e: DragStartEvent) {
    const t = tickets.find((x) => x.id === e.active.id);
    if (t) setActive(t);
  }

  function handleEnd(e: DragEndEvent) {
    setActive(null);
    if (!e.over) return;
    const ticketId = String(e.active.id);
    const newStatus = String(e.over.id) as TicketStatus;
    const current = tickets.find((t) => t.id === ticketId);
    if (!current || current.status === newStatus) return;

    const previous = tickets;
    setTickets((ts) =>
      ts.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    setError(null);

    startTransition(async () => {
      const res = await moveTicket(ticketId, newStatus);
      if (!res.ok) {
        setTickets(previous);
        setError(res.error);
        setTimeout(() => setError(null), 4000);
      }
    });
  }

  const groups = KANBAN_ORDER.map((status) => {
    const list = tickets.filter((t) => t.status === status);
    return {
      status,
      list,
      total: list.reduce((s, t) => s + t.total, 0),
    };
  });

  return (
    <>
      {error && (
        <div className="mb-3 mx-6 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleStart}
        onDragEnd={handleEnd}
      >
        <div className="flex gap-3 sm:gap-4 min-w-max pb-4 px-4 sm:px-6 snap-x snap-mandatory sm:snap-none">
          {groups.map((g) => (
            <Column
              key={g.status}
              status={g.status}
              tickets={g.list}
              totalAmount={g.total}
            />
          ))}
        </div>
        <DragOverlay>
          {active ? <TicketCard ticket={active} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
