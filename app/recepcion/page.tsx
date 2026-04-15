import Topbar from "@/components/Topbar";
import { createTicket } from "./actions";

export default function RecepcionPage() {
  return (
    <>
      <Topbar title="Recepción de equipo" />
      <div className="p-6 max-w-3xl">
        <form action={createTicket} className="card p-6 space-y-6">
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

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="reset" className="btn-ghost">
              Limpiar
            </button>
            <button type="submit" className="btn-primary">
              Generar folio →
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
