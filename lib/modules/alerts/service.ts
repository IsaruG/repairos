import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  href: string;
  kind: "sla" | "quote_pending" | "payment_due" | "low_stock" | "stock_out" | "unassigned";
  createdAt: string;
};

const ACTIVE_STATUSES = [
  "NEW",
  "DIAGNOSIS",
  "QUOTED",
  "APPROVED",
  "REPAIRING",
  "READY",
];

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

export async function computeAlerts(me: SessionUser): Promise<Alert[]> {
  const tenantId = me.tenantId;
  const now = Date.now();

  const [tickets, parts] = await Promise.all([
    prisma.ticket.findMany({
      where: { tenantId, status: { in: ACTIVE_STATUSES } },
      include: { customer: true, device: true, payments: true },
      orderBy: { receivedAt: "asc" },
    }),
    prisma.part.findMany({
      where: { tenantId },
      orderBy: { stock: "asc" },
    }),
  ]);

  const alerts: Alert[] = [];

  for (const t of tickets) {
    const ageH = (now - t.receivedAt.getTime()) / HOUR;
    const label = `${t.device.brand} ${t.device.model} · ${t.customer.name}`;

    // SLA: receivedAt > 72h and still not DELIVERED
    if (ageH > 72) {
      alerts.push({
        id: `sla-${t.id}`,
        severity: "critical",
        title: `SLA superado · ${t.folio}`,
        description: `${label} · ${Math.round(ageH)}h en taller`,
        href: `/tickets/${t.id}`,
        kind: "sla",
        createdAt: t.receivedAt.toISOString(),
      });
    } else if (ageH > 48) {
      alerts.push({
        id: `sla-${t.id}`,
        severity: "warning",
        title: `SLA en riesgo · ${t.folio}`,
        description: `${label} · ${Math.round(ageH)}h en taller`,
        href: `/tickets/${t.id}`,
        kind: "sla",
        createdAt: t.receivedAt.toISOString(),
      });
    }

    // Quote pending > 48h
    if (t.status === "QUOTED" && ageH > 48) {
      alerts.push({
        id: `quote-${t.id}`,
        severity: "warning",
        title: `Cotización sin respuesta · ${t.folio}`,
        description: `${label} · esperando hace ${Math.round(ageH)}h`,
        href: `/tickets/${t.id}`,
        kind: "quote_pending",
        createdAt: t.receivedAt.toISOString(),
      });
    }

    // Unassigned active ticket
    if (!t.technicianId && t.status !== "NEW") {
      alerts.push({
        id: `unassigned-${t.id}`,
        severity: "warning",
        title: `Sin técnico asignado · ${t.folio}`,
        description: label,
        href: `/tickets/${t.id}`,
        kind: "unassigned",
        createdAt: t.receivedAt.toISOString(),
      });
    }

    // Ready without payment
    if (t.status === "READY") {
      const paid = t.payments.reduce((s, p) => s + p.amount, 0);
      if (paid < t.total * 0.99) {
        alerts.push({
          id: `payment-${t.id}`,
          severity: "info",
          title: `Listo pero con saldo · ${t.folio}`,
          description: `${label} · pendiente $${(t.total - paid).toLocaleString("es-MX")}`,
          href: `/tickets/${t.id}`,
          kind: "payment_due",
          createdAt: t.receivedAt.toISOString(),
        });
      }
    }
  }

  for (const p of parts) {
    if (p.stock === 0) {
      alerts.push({
        id: `stockout-${p.id}`,
        severity: "critical",
        title: `Agotado · ${p.name}`,
        description: `SKU ${p.sku} sin existencias`,
        href: `/inventario`,
        kind: "stock_out",
        createdAt: p.updatedAt.toISOString(),
      });
    } else if (p.stock <= p.minStock) {
      alerts.push({
        id: `lowstock-${p.id}`,
        severity: "warning",
        title: `Stock bajo · ${p.name}`,
        description: `Quedan ${p.stock} · mínimo ${p.minStock}`,
        href: `/inventario`,
        kind: "low_stock",
        createdAt: p.updatedAt.toISOString(),
      });
    }
  }

  // Severity sort: critical > warning > info
  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return alerts;
}

export async function alertCounts(me: SessionUser) {
  const list = await computeAlerts(me);
  return {
    total: list.length,
    critical: list.filter((a) => a.severity === "critical").length,
    warning: list.filter((a) => a.severity === "warning").length,
    info: list.filter((a) => a.severity === "info").length,
  };
}
