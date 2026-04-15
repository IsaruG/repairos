import Topbar from "@/components/Topbar";
import { createTicket } from "./actions";
import { getSession, hasRole } from "@/lib/auth";
import { Lock } from "lucide-react";

export default async function RecepcionPage() {
  const me = await getSession();
  if (!me) return null;

  if (!hasRole(me, "RECEPTION")) {
    return (
      <>
        <Topbar title="Recepción" />
        <div className="p-6 grid place-items-center min-h-[60vh]">
          <div className="card p-8 text-center max-w-sm">
            <Lock className="h-8 w-8 mx-auto text-slate-400 mb-3" />
            <h2 className="font-semibold mb-1">Acceso restringido</h2>
            <p className="text-sm text-slate-500">
              Solo recepción y administradores pueden recibir equipos.
            </p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Topbar title="Recepción de equipo" />
      <div className="p-4 sm:p-6 max-w-3xl w-full">
        <form action={createTicket} className="card p-4 sm:p-6 space-y-6">
          <section>
            <h2 className="font-semibold text-sm text-slate-700 mb-3">
              1 · Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input className="input" name="customerName" required />
              </div>
              <div>
                <label className="label">Teléfono *</label>
                <input className="input" name="phone" required />
              </div>
              <div className="md:col-span-2">
                <label className="label">Email (opcional)</label>
                <input className="input" name="email" type="email" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-sm text-slate-700 mb-3">
              2 · Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Marca *</label>
                <input
                  className="input"
                  name="brand"
                  required
                  placeholder="Apple, Samsung…"
                />
              </div>
              <div>
                <label className="label">Modelo *</label>
                <input
                  className="input"
                  name="model"
                  required
                  placeholder="iPhone 13"
                />
              </div>
              <div>
                <label className="label">IMEI</label>
                <input className="input font-mono" name="imei" />
              </div>
              <div>
                <label className="label">Color</label>
                <input className="input" name="color" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Problema reportado *</label>
                <textarea
                  className="input min-h-[100px]"
                  name="reportedIssue"
                  required
                  placeholder="Descripción del problema según el cliente…"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-sm text-slate-700 mb-3">
              3 · Confirmación
            </h2>
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="mt-0.5" required />
              El cliente acepta términos y condiciones de servicio. Firma digital
              simulada para el demo.
            </label>
          </section>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="reset" className="btn-ghost w-full sm:w-auto">
              Limpiar
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Generar folio →
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
