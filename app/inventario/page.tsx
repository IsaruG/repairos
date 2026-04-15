import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AlertCircle, AlertTriangle, Package, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

function stockBadge(stock: number, min: number) {
  if (stock === 0)
    return {
      label: "Agotado",
      tone: "bg-red-100 text-red-700 ring-red-200",
      icon: AlertCircle,
    };
  if (stock <= min)
    return {
      label: "Bajo",
      tone: "bg-amber-100 text-amber-700 ring-amber-200",
      icon: AlertTriangle,
    };
  return {
    label: "OK",
    tone: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    icon: Package,
  };
}

export default async function InventarioPage() {
  const me = await getSession();
  if (!me) return null;

  const parts = await prisma.part.findMany({
    where: { tenantId: me.tenantId },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  const totalValue = parts.reduce((s, p) => s + p.stock * p.cost, 0);
  const lowCount = parts.filter((p) => p.stock <= p.minStock).length;
  const outCount = parts.filter((p) => p.stock === 0).length;

  return (
    <>
      <Topbar title="Inventario" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  SKUs totales
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
                  {parts.length}
                </div>
              </div>
              <Package className="h-5 w-5 text-brand-600" />
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  Valor en stock
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
                  ${totalValue.toLocaleString("es-MX")}
                </div>
              </div>
              <TrendingDown className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  Stock bajo
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums text-amber-600">
                  {lowCount}
                </div>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  Agotados
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums text-red-600">
                  {outCount}
                </div>
              </div>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold">Partes y refacciones</h2>
            <span className="text-xs text-slate-500">
              Ordenado por stock
            </span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2">SKU</th>
                  <th className="text-left px-5 py-2">Parte</th>
                  <th className="text-left px-5 py-2">Compatibilidad</th>
                  <th className="text-right px-5 py-2">Costo</th>
                  <th className="text-right px-5 py-2">Precio</th>
                  <th className="text-center px-5 py-2">Stock</th>
                  <th className="text-left px-5 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => {
                  const b = stockBadge(p.stock, p.minStock);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.brand}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 max-w-[200px] truncate">
                        {p.compatibleModels ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        ${p.cost.toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        ${p.price.toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3 text-center tabular-nums">
                        <span className="font-semibold">{p.stock}</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          / mín {p.minStock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`pill ring-1 ${b.tone}`}>
                          {b.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {parts.map((p) => {
              const b = stockBadge(p.stock, p.minStock);
              return (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-slate-500">
                        {p.sku}
                      </div>
                      <div className="font-medium text-sm truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {p.brand} · {p.compatibleModels ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold tabular-nums">
                          ${p.price.toLocaleString("es-MX")}
                        </span>
                        <span className="text-slate-400 ml-2">
                          costo ${p.cost.toLocaleString("es-MX")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`pill ring-1 ${b.tone}`}>
                        {b.label}
                      </span>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {p.stock}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {" "}
                          /{p.minStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {parts.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              Sin partes registradas.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
