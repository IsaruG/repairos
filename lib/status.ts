import type { TicketStatus } from "@prisma/client";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  NEW: "Nuevo",
  DIAGNOSIS: "Diagnóstico",
  QUOTED: "Cotizado",
  APPROVED: "Aprobado",
  REPAIRING: "Reparando",
  READY: "Listo",
  DELIVERED: "Entregado",
  ISSUE: "Problema",
};

export const STATUS_COLOR: Record<TicketStatus, string> = {
  NEW: "bg-blue-100 text-blue-700 ring-blue-200",
  DIAGNOSIS: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  QUOTED: "bg-violet-100 text-violet-700 ring-violet-200",
  APPROVED: "bg-teal-100 text-teal-700 ring-teal-200",
  REPAIRING: "bg-orange-100 text-orange-700 ring-orange-200",
  READY: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  DELIVERED: "bg-slate-100 text-slate-600 ring-slate-200",
  ISSUE: "bg-red-100 text-red-700 ring-red-200",
};

export const KANBAN_ORDER: TicketStatus[] = [
  "NEW",
  "DIAGNOSIS",
  "QUOTED",
  "REPAIRING",
  "READY",
  "DELIVERED",
];
