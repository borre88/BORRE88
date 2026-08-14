"use client";

import { Fragment, useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { submitWeeklyCheckin } from "./actions";
import type { Tables } from "@/lib/database.types";
import type { Gender } from "@/lib/health-score";
import { BODY_MEASUREMENT_FIELDS, type MeasurementKey } from "@/lib/body-measurements";
import { BodySilhouette } from "@/components/body-silhouette";

type Checkin = Tables<"weekly_checkins">;

// Coppie sinistra/destra allineate in altezza alla figura: spalle, petto/vita,
// fianchi/glutei, cosce, polpacci, polsi.
const MEASUREMENT_ROWS: [MeasurementKey, MeasurementKey][] = [
  ["braccio_sx_cm", "braccio_dx_cm"],
  ["petto_cm", "vita_cm"],
  ["fianchi_cm", "glutei_cm"],
  ["coscia_sx_cm", "coscia_dx_cm"],
  ["polpaccio_sx_cm", "polpaccio_dx_cm"],
  ["polso_sx_cm", "polso_dx_cm"],
];

const FIELD_LABELS = Object.fromEntries(BODY_MEASUREMENT_FIELDS.map((f) => [f.key, f.label])) as Record<
  MeasurementKey,
  string
>;

export function CheckinForm({ current, gender }: { current: Checkin | null; gender: Gender | null }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [showBody, setShowBody] = useState(
    () => current !== null && BODY_MEASUREMENT_FIELDS.some((f) => current[f.key] !== null)
  );

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

      <button
        type="button"
        onClick={() => setShowBody((v) => !v)}
        className="mb-3.5 flex w-full items-center justify-between rounded-lg border border-line bg-cream px-3 py-2 text-xs font-medium text-ink-soft"
      >
        <span>Misure corpo (facoltativo — anche solo alcune)</span>
        {showBody ? <ChevronUp size={14} strokeWidth={2.2} /> : <ChevronDown size={14} strokeWidth={2.2} />}
      </button>

      {showBody && (
        <div
          className="mb-3.5 grid items-center gap-x-2 gap-y-3"
          style={{ gridTemplateColumns: "1fr 14px auto 14px 1fr" }}
        >
          <div
            className="flex justify-center"
            style={{ gridColumn: 3, gridRow: `1 / ${MEASUREMENT_ROWS.length + 1}` }}
          >
            <BodySilhouette
              gender={gender}
              className={`h-64 w-[85px] ${gender === "maschio" ? "fill-teal" : "fill-teal/50"}`}
            />
          </div>
          {MEASUREMENT_ROWS.map(([leftKey, rightKey], i) => (
            <Fragment key={leftKey}>
              <div style={{ gridColumn: 1, gridRow: i + 1 }}>
                <label className="mb-1 block text-[11px] font-medium leading-tight text-ink-soft" htmlFor={leftKey}>
                  {FIELD_LABELS[leftKey]} (cm)
                </label>
                <input
                  id={leftKey}
                  name={leftKey}
                  type="number"
                  step={0.1}
                  min={0}
                  defaultValue={current?.[leftKey] ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="self-center border-t border-dashed border-line" style={{ gridColumn: 2, gridRow: i + 1 }} />
              <div className="self-center border-t border-dashed border-line" style={{ gridColumn: 4, gridRow: i + 1 }} />
              <div style={{ gridColumn: 5, gridRow: i + 1 }}>
                <label className="mb-1 block text-[11px] font-medium leading-tight text-ink-soft" htmlFor={rightKey}>
                  {FIELD_LABELS[rightKey]} (cm)
                </label>
                <input
                  id={rightKey}
                  name={rightKey}
                  type="number"
                  step={0.1}
                  min={0}
                  defaultValue={current?.[rightKey] ?? ""}
                  className={inputClass}
                />
              </div>
            </Fragment>
          ))}
        </div>
      )}

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
