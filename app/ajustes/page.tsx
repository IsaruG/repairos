import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { getSession, hasRole } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { LogOut, Shield, Building2, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-700 ring-red-200",
  RECEPTION: "bg-blue-50 text-blue-700 ring-blue-200",
  TECHNICIAN: "bg-orange-50 text-orange-700 ring-orange-200",
  CLIENT: "bg-slate-50 text-slate-600 ring-slate-200",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  RECEPTION: "Recepción",
  TECHNICIAN: "Técnico",
  CLIENT: "Cliente",
};

export default async function AjustesPage() {
  const me = await getSession();
  if (!me) return null;

  const [users, branches, tenant] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId: me.tenantId },
      include: { branch: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.branch.findMany({ where: { tenantId: me.tenantId } }),
    prisma.tenant.findUnique({ where: { id: me.tenantId } }),
  ]);

  const isAdmin = hasRole(me, "ADMIN");

  return (
    <>
      <Topbar title="Ajustes" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">
        {/* My profile */}
        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" /> Mi sesión
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Nombre</div>
              <div className="font-medium">{me.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Correo</div>
              <div className="font-medium break-all">{me.email}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Rol</div>
              <div>
                <span
                  className={`pill ring-1 ${ROLE_BADGE[me.role] ?? ROLE_BADGE.CLIENT}`}
                >
                  {ROLE_LABEL[me.role]}
                </span>
              </div>
            </div>
          </div>
          <form action={logoutAction} className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="btn-ghost text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </section>

        {/* Organization */}
        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-600" /> Organización
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Nombre</div>
              <div className="font-medium">{tenant?.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Plan</div>
              <div className="font-medium uppercase">{tenant?.plan}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Sucursales</div>
              <div className="font-medium">{branches.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Usuarios</div>
              <div className="font-medium">{users.length}</div>
            </div>
          </div>
        </section>

        {/* Users list — ADMIN only */}
        {isAdmin && (
          <section className="card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-600" /> Usuarios del taller
              </h2>
              <span className="text-xs text-slate-500">{users.length} total</span>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-2">Nombre</th>
                    <th className="text-left px-5 py-2">Email</th>
                    <th className="text-left px-5 py-2">Rol</th>
                    <th className="text-left px-5 py-2">Sucursal</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`pill ring-1 ${ROLE_BADGE[u.role] ?? ROLE_BADGE.CLIENT}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {u.branch?.name ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {u.email}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {u.branch?.name ?? "—"}
                      </div>
                    </div>
                    <span
                      className={`pill ring-1 shrink-0 ${ROLE_BADGE[u.role] ?? ROLE_BADGE.CLIENT}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isAdmin && (
          <div className="text-xs text-slate-500 text-center py-2">
            La gestión de usuarios está disponible solo para administradores.
          </div>
        )}
      </div>
    </>
  );
}
