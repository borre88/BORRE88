"use client";

import { useState, useTransition } from "react";
import { submitWeeklyCheckin } from "./actions";
import type { Tables } from "@/lib/database.types";

type Checkin = Tables<"weekly_checkins">;

export function CheckinForm({ current }: { current: Checkin | null }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await submitWeeklyCheckin(undefined, formData);
      if (result?.error) {
        setError(result.error);
        setSuccess(false);
      } else {
        setError(null);
        setSuccess(true);
      }
    });
  }

  const inputClass =
    "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal";

  return (
    <form action={action} className="rounded-xl border border-line bg-surface px-5 py-4">
      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="weight_kg">
            Peso (kg)
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step={0.1}
            defaultValue={current?.weight_kg ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="workouts_count">
            Allenamenti fatti
          </label>
          <input
            id="workouts_count"
            name="workouts_count"
            type="number"
            step={1}
            defaultValue={current?.workouts_count ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="sleep_hours">
            Ore di sonno medie
          </label>
          <input
            id="sleep_hours"
            name="sleep_hours"
            type="number"
            step={0.5}
            min={0}
            max={24}
            defaultValue={current?.sleep_hours ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="stress_level">
            Livello di stress (1-10)
          </label>
          <input
            id="stress_level"
            name="stress_level"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={current?.stress_level ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="tiredness">
            Stanchezza (1-10)
          </label>
          <input
            id="tiredness"
            name="tiredness"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={current?.tiredness ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="energy">
            Energia (1-10)
          </label>
          <input
            id="energy"
            name="energy"
            type="number"
            min={1}
            max={10}
            step={1}
            defaultValue={current?.energy ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="diet_slips">
            Pasti sgarro nella settimana
          </label>
          <input
            id="diet_slips"
            name="diet_slips"
            type="number"
            step={1}
            defaultValue={current?.diet_slips ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="notes">
        Altro da segnalare
      </label>
      <textarea
        id="notes"
        name="notes"
        rows={3}
        defaultValue={current?.notes ?? ""}
        placeholder="Come ti sei sentito questa settimana, imprevisti, dolori, note libere…"
        className={inputClass}
      />

      {error && <p className="mt-3 text-xs font-medium text-bad">{error}</p>}
      {success && !error && <p className="mt-3 text-xs font-medium text-good">Check salvato.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : current ? "Aggiorna check" : "Invia check"}
      </button>
    </form>
  );
}
