"use client";

import { useMemo, useState, useTransition } from "react";
import { Lock, Unlock, RotateCcw, Pencil } from "lucide-react";
import { WEEKDAY_LABELS_SHORT, MACRO_ACCENT, dayLabelDotClass } from "@/lib/diet-calc";
import { Switch } from "@/components/ui";

const LABEL_PRESETS = ["Ricarica", "Scarico", "Allenamento", "Riposo", "Gara"];
const TRAINING_WEEKDAYS = [0, 1, 3, 4, 5]; // Lun, Mar, Gio, Ven, Sab (resto: Mer, Dom = riposo)

import type { Tables } from "@/lib/database.types";
import {
  upsertPlanDay,
  clearPlanDayOverride,
  applyDayPreset,
  clearAllPlanDayOverrides,
  toggleDayLock,
  renameDayLabel,
  copyDayTargetsTo,
  type DayPresetRow,
} from "./actions";

type PlanDay = Tables<"diet_plan_days">;

export function DayTargetsTable({
  clientId,
  planId,
  days,
  defaultKcal,
  defaultProtein,
  defaultCarbs,
  defaultFat,
}: {
  clientId: string;
  planId: string;
  days: PlanDay[];
  defaultKcal: number | null;
  defaultProtein: number | null;
  defaultCarbs: number | null;
  defaultFat: number | null;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(days.length > 0);
  const [renamingLabel, setRenamingLabel] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const byWeekday = new Map(days.map((d) => [d.weekday, d]));
  const lockedSet = new Set(days.filter((d) => d.locked).map((d) => d.weekday));

  const labelsInUse = useMemo(() => {
    const set = new Set(days.map((d) => d.label).filter((l): l is string => Boolean(l?.trim())));
    return Array.from(set);
  }, [days]);

  function save(weekday: number, label: string, kcal: string, protein: string, carbs: string, fat: string) {
    startTransition(() => {
      upsertPlanDay(clientId, planId, weekday, {
        label: label.trim() || null,
        target_kcal: kcal.trim() ? Number(kcal) : null,
        target_protein_g: protein.trim() ? Number(protein) : null,
        target_carbs_g: carbs.trim() ? Number(carbs) : null,
        target_fat_g: fat.trim() ? Number(fat) : null,
      });
    });
  }

  function rowFor(weekday: number, label: string | null, pct: number): DayPresetRow {
    const carbs = defaultCarbs != null ? Math.round(defaultCarbs * (1 + pct)) : null;
    const protein = defaultProtein;
    const fat = defaultFat;
    let kcal: number | null;
    if (protein != null && carbs != null && fat != null) kcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
    else if (defaultKcal != null) kcal = Math.round(defaultKcal * (1 + pct));
    else kcal = null;
    return { weekday, label, target_kcal: kcal, target_protein_g: protein, target_carbs_g: carbs, target_fat_g: fat };
  }

  function unlockedWeekdays() {
    return [0, 1, 2, 3, 4, 5, 6].filter((w) => !lockedSet.has(w));
  }

  function applyAllEqual() {
    startTransition(() => clearAllPlanDayOverrides(clientId, planId));
  }

  function applyTrainingRest() {
    const rows = unlockedWeekdays().map((w) =>
      TRAINING_WEEKDAYS.includes(w) ? rowFor(w, "Allenamento", 0.15) : rowFor(w, "Riposo", -0.15)
    );
    startTransition(() => applyDayPreset(clientId, planId, rows));
  }

  function applyWeekendCarbs() {
    const rows = unlockedWeekdays().map((w) => (w === 5 || w === 6 ? rowFor(w, "Ricarica", 0.3) : rowFor(w, null, 0)));
    startTransition(() => applyDayPreset(clientId, planId, rows));
  }

  function applyAlternating() {
    const rows = unlockedWeekdays().map((w) => (w % 2 === 0 ? rowFor(w, "Ricarica", 0.15) : rowFor(w, "Scarico", -0.15)));
    startTransition(() => applyDayPreset(clientId, planId, rows));
  }

  function submitRename(oldLabel: string) {
    const next = renameValue.trim();
    if (next && next !== oldLabel) {
      startTransition(() => renameDayLabel(clientId, planId, oldLabel, next));
    }
    setRenamingLabel(null);
  }

  const shortcutsDisabled = defaultKcal == null;

  const kcalValues = [0, 1, 2, 3, 4, 5, 6].map((w) => byWeekday.get(w)?.target_kcal ?? defaultKcal ?? 0);
  const maxKcal = Math.max(...kcalValues, defaultKcal ?? 0, 1);
  const positiveValues = kcalValues.filter((v) => v > 0);
  const minKcal = positiveValues.length > 0 ? Math.min(...positiveValues) : 0;
  const maxKcalValue = positiveValues.length > 0 ? Math.max(...positiveValues) : 0;
  const avgKcal = Math.round(kcalValues.reduce((a, b) => a + b, 0) / 7);
  const onTarget = defaultKcal != null && Math.abs(avgKcal - defaultKcal) <= 50;
  const targetLinePct = defaultKcal != null ? Math.min(100, (defaultKcal / maxKcal) * 100) : null;

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold">Target giorno per giorno</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
            Facoltativo. Un target diverso per ogni giorno della settimana: l&apos;editor confronterà ogni giorno con il
            suo, e la media resta quella qui sopra.
          </p>
        </div>
        <Switch checked={open} onChange={setOpen} />
      </div>

      {open && (
        <div className="border-t border-line">
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Scorciatoie</span>
            {[
              { label: "Tutti uguali", onClick: applyAllEqual },
              { label: "Allenamento / Riposo", onClick: applyTrainingRest },
              { label: "Più carboidrati nel weekend", onClick: applyWeekendCarbs },
              { label: "Giorni alterni", onClick: applyAlternating },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={pending || shortcutsDisabled}
                onClick={s.onClick}
                className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal disabled:opacity-40"
              >
                {s.label}
              </button>
            ))}
          </div>

          {labelsInUse.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Etichette in uso
              </span>
              {labelsInUse.map((label) => (
                <span key={label}>
                  {renamingLabel === label ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => submitRename(label)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") setRenamingLabel(null);
                      }}
                      className="w-24 rounded-full border border-teal bg-surface px-2.5 py-0.5 text-[10.5px] outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingLabel(label);
                        setRenameValue(label);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[10.5px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${dayLabelDotClass(label)}`} />
                      {label}
                      <Pencil size={9} strokeWidth={2.2} className="opacity-50" />
                    </button>
                  )}
                </span>
              ))}
              <span className="text-[10.5px] text-ink-faint">tocca un&apos;etichetta per rinominarla ovunque</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-cream">
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Giorno</th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Etichetta</th>
                  <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.protein.text}`}>P (g)</th>
                  <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.carbs.text}`}>C (g)</th>
                  <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.fat.text}`}>G (g)</th>
                  <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">Energia</th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Copia su</th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAY_LABELS_SHORT.map((wd, weekday) => {
                  const day = byWeekday.get(weekday);
                  return (
                    <DayRow
                      key={weekday}
                      weekday={weekday}
                      label={wd}
                      day={day}
                      locked={lockedSet.has(weekday)}
                      defaultKcal={defaultKcal}
                      defaultProtein={defaultProtein}
                      defaultCarbs={defaultCarbs}
                      defaultFat={defaultFat}
                      pending={pending}
                      onSave={save}
                      onClear={() => startTransition(() => clearPlanDayOverride(clientId, planId, weekday))}
                      onToggleLock={() =>
                        startTransition(() => toggleDayLock(clientId, planId, weekday, !lockedSet.has(weekday)))
                      }
                      onCopyTo={(toWeekday) => startTransition(() => copyDayTargetsTo(clientId, planId, weekday, toWeekday))}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {defaultKcal != null && (
            <div className="border-t border-line px-4 py-3.5">
              <div className="relative flex h-16 items-end gap-2">
                {targetLinePct !== null && (
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-ink-faint/50"
                    style={{ bottom: `${targetLinePct}%` }}
                  >
                    <span className="absolute right-0 -top-3.5 text-[9px] text-ink-faint">target del piano</span>
                  </div>
                )}
                {WEEKDAY_LABELS_SHORT.map((wd, weekday) => {
                  const value = kcalValues[weekday];
                  const day = byWeekday.get(weekday);
                  const heightPct = Math.max(2, Math.round((value / maxKcal) * 100));
                  return (
                    <div key={weekday} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={`w-full max-w-[22px] rounded-t ${dayLabelDotClass(day?.label ?? null)}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${wd}: ${value} kcal`}
                      />
                      <span className="text-[9.5px] text-ink-faint">{wd}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11.5px] text-ink-soft">
                {onTarget ? "✅" : "⚠️"} La media della settimana è <strong>{avgKcal} kcal</strong>:{" "}
                {onTarget ? "torna" : "non torna"} con il target del piano ({defaultKcal}).
              </p>
              {maxKcalValue > minKcal && (
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  Dal più basso al più alto: {minKcal} → {maxKcalValue} kcal.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayRow({
  weekday,
  label,
  day,
  locked,
  defaultKcal,
  defaultProtein,
  defaultCarbs,
  defaultFat,
  pending,
  onSave,
  onClear,
  onToggleLock,
  onCopyTo,
}: {
  weekday: number;
  label: string;
  day: Tables<"diet_plan_days"> | undefined;
  locked: boolean;
  defaultKcal: number | null;
  defaultProtein: number | null;
  defaultCarbs: number | null;
  defaultFat: number | null;
  pending: boolean;
  onSave: (weekday: number, label: string, kcal: string, protein: string, carbs: string, fat: string) => void;
  onClear: () => void;
  onToggleLock: () => void;
  onCopyTo: (toWeekday: number) => void;
}) {
  const [dayLabel, setDayLabel] = useState(day?.label ?? "");
  const [kcal, setKcal] = useState(day?.target_kcal?.toString() ?? "");
  const [protein, setProtein] = useState(day?.target_protein_g?.toString() ?? "");
  const [carbs, setCarbs] = useState(day?.target_carbs_g?.toString() ?? "");
  const [fat, setFat] = useState(day?.target_fat_g?.toString() ?? "");

  const cellInput = "w-16 rounded border border-line bg-cream px-1.5 py-1 text-right text-[12px] outline-none focus:border-teal disabled:opacity-50";
  const kcalValue = day?.target_kcal ?? null;
  const delta = kcalValue != null && defaultKcal != null ? kcalValue - defaultKcal : null;

  return (
    <tr className="border-t border-line">
      <td className="px-3 py-1.5 font-medium">
        <span className="flex items-center gap-1">
          {label}
          <button
            type="button"
            onClick={onToggleLock}
            aria-label={locked ? "Sblocca giorno" : "Blocca giorno"}
            className={`ml-0.5 ${locked ? "text-teal" : "text-ink-faint/50 hover:text-ink-faint"}`}
          >
            {locked ? <Lock size={11} strokeWidth={2.2} /> : <Unlock size={11} strokeWidth={2.2} />}
          </button>
        </span>
      </td>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dayLabelDotClass(dayLabel)}`} />
          <input
            disabled={locked}
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
            placeholder="+ etichetta"
            list={`day-label-presets-${weekday}`}
            className="w-24 rounded border border-line bg-cream px-1.5 py-1 text-[12px] outline-none focus:border-teal disabled:opacity-50"
          />
          <datalist id={`day-label-presets-${weekday}`}>
            {LABEL_PRESETS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
      </td>
      <td className="px-3 py-1.5 text-right">
        <input
          disabled={locked}
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultProtein?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <input
          disabled={locked}
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultCarbs?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <input
          disabled={locked}
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultFat?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <input
            disabled={locked}
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
            placeholder={defaultKcal?.toString() ?? "-"}
            className={cellInput}
          />
          {delta !== null && delta !== 0 && (
            <span className={`text-[10px] font-medium ${delta > 0 ? "text-bad" : "text-good"}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          {day && !locked && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setDayLabel("");
                setKcal("");
                setProtein("");
                setCarbs("");
                setFat("");
                onClear();
              }}
              aria-label="Reset"
              className="text-ink-faint hover:text-bad"
            >
              <RotateCcw size={11} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-1.5">
        <select
          disabled={pending}
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) onCopyTo(Number(v));
            e.target.value = "";
          }}
          className="w-full rounded border border-line bg-cream px-1.5 py-1 text-[11px] text-ink-soft outline-none focus:border-teal"
        >
          <option value="">Copia su…</option>
          {WEEKDAY_LABELS_SHORT.map((w, i) =>
            i === weekday ? null : (
              <option key={i} value={i}>
                {w}
              </option>
            )
          )}
        </select>
      </td>
    </tr>
  );
}
