"use client";

import { useState, useTransition } from "react";
import { ClipboardList, X, Copy, Check } from "lucide-react";
import { createIntakeForm } from "../questionari/actions";

export function SendIntakeModal({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const result = await createIntakeForm(`${clientName} - aggiornamento anamnesi`, clientId);
      if (result.error) setError(result.error);
      else if (result.link) setLink(result.link);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setLink(null);
          setError(null);
        }}
        className="flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft"
      >
        <ClipboardList size={15} strokeWidth={2.2} />
        Invia questionario
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-surface px-5 py-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">Questionario</div>
                <div className="font-display text-lg font-bold">Manda un link a {clientName}</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="text-ink-soft">
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <p className="mb-3 text-[12.5px] text-ink-faint">
              Il cliente aggiorna la sua anamnesi da casa, senza bisogno di accedere con un account.
            </p>

            {!link ? (
              <button
                type="button"
                disabled={pending}
                onClick={generate}
                className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Creazione…" : "Genera link"}
              </button>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <input readOnly value={link} className="flex-1 rounded-md border border-line bg-cream px-2.5 py-1.5 text-[12px]" />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 rounded-md bg-teal px-2.5 py-1.5 text-[11px] font-medium text-white"
                  >
                    {copied ? <Check size={12} strokeWidth={2.2} /> : <Copy size={12} strokeWidth={2.2} />}
                    {copied ? "Copiato" : "Copia"}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-2 text-xs font-medium text-bad">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
