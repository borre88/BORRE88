"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addMeasurement } from "../actions";
import { METRIC_GROUPS } from "@/lib/metrics";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddMeasurementModal({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await addMeasurement(clientId, undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white"
      >
        <Plus size={16} strokeWidth={2.5} />
        Nuova rilevazione
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-surface"
          >
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">
                  Nuova rilevazione
                </div>
                <div className="font-display text-lg font-bold">Inserisci i dati</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
                className="text-ink-soft"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form action={action} className="overflow-y-auto px-5 py-4">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="date">
                Data
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={todayISO()}
                required
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal"
              />

              {METRIC_GROUPS.map((group) => (
                <div key={group.key} className="mt-4">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gold">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {group.metrics.map((m) => (
                      <div key={m.key}>
                        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor={m.key}>
                          {m.label} ({m.unit})
                        </label>
                        <input
                          id={m.key}
                          name={m.key}
                          type="number"
                          step={m.step}
                          placeholder="—"
                          className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {error && <p className="mt-3 text-xs font-medium text-bad">{error}</p>}

              <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-line px-3.5 py-2 text-xs font-medium text-ink-soft"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {pending ? "Salvataggio…" : "Salva rilevazione"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
