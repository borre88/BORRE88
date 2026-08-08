"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addBloodTest } from "./actions";
import { BLOOD_MARKERS } from "@/lib/blood-markers";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddTestForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await addBloodTest(clientId, undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white"
      >
        <Plus size={16} strokeWidth={2.5} />
        Nuovo esame
      </button>
    );
  }

  const inputClass =
    "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-4">
      <div className="mb-3.5 flex items-start justify-between">
        <div className="font-display text-lg font-bold">Nuovo esame del sangue</div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <form action={action}>
        <div className="mb-3.5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="test_date">
              Data esame
            </label>
            <input id="test_date" name="test_date" type="date" defaultValue={todayISO()} required className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="lab_name">
              Laboratorio (facoltativo)
            </label>
            <input id="lab_name" name="lab_name" className={inputClass} />
          </div>
        </div>

        <div className="mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BLOOD_MARKERS.map((m) => (
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
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="notes">
          Note
        </label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />

        {error && <p className="mt-3 text-xs font-medium text-bad">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
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
            {pending ? "Salvataggio…" : "Salva esame"}
          </button>
        </div>
      </form>
    </div>
  );
}
