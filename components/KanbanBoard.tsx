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
  const slaDot =
    sla === "late"
      ? "bg-red-500"
      : sla === "warn"
        ? "bg-amber-500"
        : sla === "ok"
          ? "bg-emerald-500"
          : "";

  const baseClass =
    "rounded-lg bg-white border border-slate-200 px-2.5 py-2 select-none transition-all hover:border-brand-400 hover:shadow-sm cursor-grab active:cursor-grabbing";
  const draggingClass = isDragging ? "opacity-30" : "";
  const overlayClass = overlay ? "rotate-2 shadow-2xl ring-2 ring-brand-500/40" : "";

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={`${baseClass} ${draggingClass} ${overlayClass}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="font-mono text-[9px] text-slate-400 truncate flex-1">
          {ticket.folio.replace(/^TGR-/, "")}
        </div>
        {sla && (
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${slaDot}`} />
        )}
      </div>
      <div className="font-semibold text-[12.5px] leading-tight text-slate-900 break-words">
        {ticket.customerName}
      </div>
      <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
        {ticket.deviceLabel}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px]">
        <span className="truncate flex items-center gap-0.5 text-slate-500">
          <User className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">
            {ticket.technicianName ?? "Sin asignar"}
          </span>
        </span>
        <span className="font-bold tabular-nums text-slate-800 shrink-0">
          ${(ticket.total / 1000).toFixed(1)}k
        </span>
      </div>
      {!overlay && (
        <Link
          href={`/tickets/${ticket.id}`}
          className="hidden"
          onClick={(e) => e.stopPropagation()}
        >
          open
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
    <div className="w-[78vw] max-w-[260px] sm:w-auto sm:flex-1 sm:min-w-0 shrink-0 sm:shrink flex flex-col snap-center sm:snap-start min-h-0">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`pill ring-1 text-[10px] ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {tickets.length}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 tabular-nums">
          ${Math.round(totalAmount / 1000)}k
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 space-y-1.5 rounded-lg p-1.5 transition-colors overflow-hidden bg-slate-50/50 ${
          isOver ? "bg-brand-50 ring-2 ring-brand-500/30" : ""
        }`}
      >
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {tickets.length === 0 && (
          <div className="text-[10px] text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
            —
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
        <div className="flex gap-2 sm:gap-2 h-full px-3 sm:px-4 snap-x snap-mandatory sm:snap-none overflow-x-auto sm:overflow-visible">
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
