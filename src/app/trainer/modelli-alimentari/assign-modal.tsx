"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { X, UserCheck, ArrowRight } from "lucide-react";
import { toISODate } from "@/lib/dates";
import { assignTemplateToClient } from "./actions";

interface ClientOption {
  id: string;
  full_name: string;
}

export function AssignModal({
  templateId,
  templateName,
  clients,
  onClose,
}: {
  templateId: string;
  templateName: string;
  clients: ClientOption[];
  onClose: () => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [startDate, setStartDate] = useState(() => toISODate(new Date()));
  const [setActive, setSetActive] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [assignedClientId, setAssignedClientId] = useState<string | null>(null);

  function submit() {
    if (!clientId) {
      setError("Seleziona un cliente.");
      return;
    }
    startTransition(async () => {
      const result = await assignTemplateToClient(templateId, clientId, { startDate, setActive });
      if (result.error) setError(result.error);
      else {
        setError(null);
        setAssignedClientId(clientId);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-lg font-bold">Assegna a cliente</div>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="text-ink-soft">
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {assignedClientId ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-good/10 text-good">
              <UserCheck size={18} strokeWidth={2.2} />
            </span>
            <p className="text-[13px] text-ink-soft">
              Modello &quot;{templateName}&quot; assegnato. Il piano è stato creato nella scheda del cliente.
            </p>
            <Link
              href={`/trainer/${assignedClientId}/diete`}
              className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-xs font-medium text-white"
            >
              Apri il piano del cliente
              <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="assign-client">
                Cliente
              </label>
              <select
                id="assign-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="assign-start">
                Data inizio
              </label>
              <input
                id="assign-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <label className="mb-4 flex items-center gap-2 text-xs font-medium text-ink-soft">
              <input type="checkbox" checked={setActive} onChange={(e) => setSetActive(e.target.checked)} className="h-4 w-4 accent-teal" />
              Rendi questo il piano attivo del cliente
            </label>

            {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending || !clientId}
                onClick={submit}
                className="rounded-lg bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {pending ? "Assegnazione…" : "Assegna"}
              </button>
              <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-soft">
                Annulla
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
