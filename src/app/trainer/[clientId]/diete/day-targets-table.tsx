"use client";

import { useState, useTransition } from "react";
import { WEEKDAY_LABELS_SHORT, MACRO_ACCENT, dayLabelDotClass } from "@/lib/diet-calc";

const LABEL_PRESETS = ["Ricarica", "Scarico", "Allenamento", "Gara"];
import type { Tables } from "@/lib/database.types";
import { upsertPlanDay, clearPlanDayOverride } from "./actions";

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

  const byWeekday = new Map(days.map((d) => [d.weekday, d]));

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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 text-xs font-medium text-teal underline"
      >
        Personalizza target giorno per giorno (facoltativo)
      </button>
    );
  }

  return (
    <div className="mb-5 overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-cream">
            <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Giorno</th>
            <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Etichetta</th>
            <th className="px-3 py-2 text-right text-[10.5px] font-semibold text-ink-faint">Kcal</th>
            <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.protein.text}`}>P (g)</th>
            <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.carbs.text}`}>C (g)</th>
            <th className={`px-3 py-2 text-right text-[10.5px] font-semibold ${MACRO_ACCENT.fat.text}`}>G (g)</th>
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
                defaultKcal={defaultKcal}
                defaultProtein={defaultProtein}
                defaultCarbs={defaultCarbs}
                defaultFat={defaultFat}
                pending={pending}
                onSave={save}
                onClear={() => startTransition(() => clearPlanDayOverride(clientId, planId, weekday))}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DayRow({
  weekday,
  label,
  day,
  defaultKcal,
  defaultProtein,
  defaultCarbs,
  defaultFat,
  pending,
  onSave,
  onClear,
}: {
  weekday: number;
  label: string;
  day: Tables<"diet_plan_days"> | undefined;
  defaultKcal: number | null;
  defaultProtein: number | null;
  defaultCarbs: number | null;
  defaultFat: number | null;
  pending: boolean;
  onSave: (weekday: number, label: string, kcal: string, protein: string, carbs: string, fat: string) => void;
  onClear: () => void;
}) {
  const [dayLabel, setDayLabel] = useState(day?.label ?? "");
  const [kcal, setKcal] = useState(day?.target_kcal?.toString() ?? "");
  const [protein, setProtein] = useState(day?.target_protein_g?.toString() ?? "");
  const [carbs, setCarbs] = useState(day?.target_carbs_g?.toString() ?? "");
  const [fat, setFat] = useState(day?.target_fat_g?.toString() ?? "");

  const cellInput = "w-16 rounded border border-line bg-cream px-1.5 py-1 text-right text-[12px] outline-none focus:border-teal";

  return (
    <tr className="border-t border-line">
      <td className="px-3 py-1.5 font-medium">{label}</td>
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dayLabelDotClass(dayLabel)}`} />
          <input
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
            placeholder="+ etichetta"
            list={`day-label-presets-${weekday}`}
            className="w-24 rounded border border-line bg-cream px-1.5 py-1 text-[12px] outline-none focus:border-teal"
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
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultKcal?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <input
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultProtein?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <input
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
          placeholder={defaultCarbs?.toString() ?? "-"}
          className={cellInput}
        />
      </td>
      <td className="px-3 py-1.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <input
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            onBlur={() => onSave(weekday, dayLabel, kcal, protein, carbs, fat)}
            placeholder={defaultFat?.toString() ?? "-"}
            className={cellInput}
          />
          {day && (
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
              className="text-[10px] text-ink-faint underline"
            >
              reset
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
