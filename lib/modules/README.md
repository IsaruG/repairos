# TigerFix — Arquitectura modular (no monolito)

Cada carpeta en `lib/modules/` es un **módulo de negocio autocontenido** con su
propio servicio (business logic), tipos y — si aplica — actions de Server Components.

```
lib/modules/
├── alerts/       · Motor de alertas (SLA, stock, pagos)
├── inventory/    · Gestión de partes y stock
├── pricing/      · Catálogo de servicios y precios
├── portal/       · Portal público del cliente (URL firmada HMAC)
└── search/       · Búsqueda global fuzzy
```

## Reglas de módulos

1. **Un módulo solo expone su `service.ts`** — el resto es privado.
2. **Ningún módulo importa de otro módulo** — si necesitan compartir, se extrae a `lib/` (db, auth, utils).
3. **Las queries Prisma viven dentro del módulo** — nunca en páginas.
4. **Las páginas de `app/` son delgadas**: leen sesión, llaman al service, renderizan.
5. **Cada módulo puede extraerse a un microservicio** más adelante sin tocar el resto — basta con reemplazar `service.ts` por un cliente HTTP.

## Por qué esta forma y no microservicios

Para un SaaS en etapa MVP, microservicios reales son **overhead de ops sin retorno**
(deploys múltiples, service mesh, auth inter-servicio, observabilidad X5). La arquitectura modular
dentro de un único deployable da el 80% de los beneficios (aislamiento, testabilidad, extracción
futura) con el 20% del costo operacional.

Cuando un módulo crezca lo suficiente (ej. inventory con millones de SKUs, analytics con pipelines pesados),
se extrae a su propio servicio. Hoy, no.
