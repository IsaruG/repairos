import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/db";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/status";
import { notFound } from "next/navigation";
import { MessageSquare, Phone, Mail, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TicketDetail({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      device: true,
      technician: true,
      payments: true,
      quote: true,
    },
  });

  if (!ticket) return notFound();

  const paid = ticket.payments.reduce((s, p) => s + p.amount, 0);
  const pending = ticket.total - paid;

  return (
    <>
      <Topbar title={`Ticket ${ticket.folio}`} />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-slate-500">{ticket.folio}</div>
                <h2 className="mt-1 text-xl font-semibold">
                  {ticket.device.brand} {ticket.device.model}
                </h2>
                <div className="text-sm text-slate-600">
                  IMEI: <span className="font-mono">{ticket.device.imei ?? "—"}</span>
                </div>
              </div>
              <span className={`pill ring-1 ${STATUS_COLOR[ticket.status]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Problema reportado</div>
              <p className="text-sm">{ticket.reportedIssue}</p>
            </div>
            {ticket.diagnosis && (
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Diagnóstico</div>
                <p className="text-sm">{ticket.diagnosis}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Desglose económico</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Mano de obra</span>
                <span className="font-medium">
                  ${ticket.laborCost.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Refacciones</span>
                <span className="font-medium">
                  ${ticket.partsCost.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  ${ticket.total.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Anticipo / pagado</span>
                <span>${paid.toLocaleString("es-MX")}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Pendiente</span>
                <span className="font-semibold">
                  ${pending.toLocaleString("es-MX")}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Timeline</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-slate-400" />
                <div>
                  <div className="font-medium">Recibido</div>
                  <div className="text-xs text-slate-500">
                    {ticket.receivedAt.toLocaleString("es-MX")}
                  </div>
                </div>
              </li>
              {ticket.startedAt && (
                <li className="flex gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-orange-500" />
                  <div>
                    <div className="font-medium">Reparación iniciada</div>
                    <div className="text-xs text-slate-500">
                      {ticket.startedAt.toLocaleString("es-MX")}
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-3">Cliente</h3>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{ticket.customer.name}</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5" /> {ticket.customer.phone}
              </div>
              {ticket.customer.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-3.5 w-3.5" /> {ticket.customer.email}
                </div>
              )}
            </div>
            <button className="btn-primary w-full mt-4">
              <MessageSquare className="h-4 w-4" /> Enviar por WhatsApp
            </button>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-3">Técnico asignado</h3>
            <div className="text-sm">
              {ticket.technician?.name ?? "Sin asignar"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
