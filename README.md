# 🐯 TigerFix

**SaaS de gestión de reparaciones técnicas — from intake to delivery in 3 clicks.**

Sistema multi-tenant para talleres de reparación de celulares y electrónicos. Control total del equipo desde recepción hasta entrega, con kanban operativo, cotización, anticipos, evidencia al cliente y KPIs accionables.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn-style componentes
- **Prisma** + **SQLite** (dev) / PostgreSQL (prod)
- **Server Actions** para mutaciones
- **Lucide** icons

## Arquitectura (resumen)

```
Next.js 14 ─┬─ App Router (SSR + Server Actions)
            ├─ Prisma ORM ──── SQLite (dev) / Postgres (prod)
            ├─ Multi-tenant via tenantId + RLS (prod)
            └─ Jobs: BullMQ + Redis (roadmap)
```

Modelo core: `Tenant → Branch → User / Customer → Device → Ticket → Quote / Payment / Activity / Message`.

Ver `prisma/schema.prisma` para el detalle completo.

## Módulos implementados (MVP)

| Módulo | Estado |
|---|---|
| Dashboard con KPIs y alertas | ✅ |
| Kanban por estado (6 columnas) | ✅ |
| Recepción de equipos (server action) | ✅ |
| Detalle de ticket | ✅ |
| Cotización / pagos / WhatsApp | 🟡 roadmap |
| Automatizaciones (BullMQ) | 🟡 roadmap |
| RBAC + multi-sucursal | 🟡 scaffold |

## Estados del ticket

`NEW → DIAGNOSIS → QUOTED → APPROVED → REPAIRING → READY → DELIVERED` (+ `ISSUE`).

Colores: Nuevo 🔵 · Diagnóstico 🟡 · Cotizado 🟣 · Reparando 🟠 · Listo 🟢 · Entregado ⚪ · Problema 🔴

## Quickstart

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abre http://localhost:3000

Genera un nuevo ticket en `/recepcion` — el folio se crea con formato `CDMX-YYMM-SEQ`.

## KPIs calculados

- Tiempo promedio de reparación (TAT)
- Tasa de aprobación de cotizaciones
- Ingresos por técnico / por día
- Tasa de retrasos (SLA)
- Ticket promedio
- % de anticipos cobrados

Roadmap: tabla materializada `metrics_daily` recalculada por cron.

## Roadmap

14 semanas a producción. Ver sección correspondiente en la propuesta de diseño.

---

Construido por Egger Enterprises.
