"use client";

import { useState } from "react";
import { Copy, MessageCircle, Check, ExternalLink, Link2 } from "lucide-react";

export default function PortalShareCard({
  url,
  folio,
  customerName,
  customerPhone,
}: {
  url: string;
  folio: string;
  customerName: string;
  customerPhone: string;
}) {
  const [copied, setCopied] = useState(false);

  const message = `Hola ${customerName.split(" ")[0]}, tu equipo está en nuestro taller. Sigue el progreso en tiempo real aquí: ${url}`;
  const phoneDigits = customerPhone.replace(/\D/g, "");
  const waNumber = phoneDigits.startsWith("52")
    ? phoneDigits
    : `52${phoneDigits}`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="card border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-amber-50 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-brand-600 grid place-items-center text-white">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Portal del cliente</h3>
            <p className="text-[11px] text-slate-500">
              Comparte este enlace para que vea el progreso en tiempo real
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2">
          <code className="flex-1 text-[11px] text-slate-600 font-mono truncate">
            {url}
          </code>
          <button
            onClick={copy}
            className="btn-ghost p-1.5 text-xs shrink-0"
            aria-label="Copiar enlace"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener"
            className="btn bg-emerald-500 text-white hover:bg-emerald-600 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Enviar por WhatsApp
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="btn-ghost border border-slate-200 bg-white text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver portal
          </a>
        </div>
      </div>
    </div>
  );
}
