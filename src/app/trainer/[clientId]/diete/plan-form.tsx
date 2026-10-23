"use client";

import { useMemo, useState, useTransition } from "react";
import { Flame, Zap, Target, Sparkles, X, NotebookPen, CalendarDays, Hourglass, FlagTriangleRight } from "lucide-react";
import { ACTIVITY_LABELS, ACTIVITY_MULTIPLIERS, calculateBMR, type Gender } from "@/lib/health-score";
import {
  PHASE_LABELS,
  SPEED_LABELS,
  PHASE_SPEED_VARIATION,
  PHASE_ACCENT,
  BALANCE_ACCENT,
  MACRO_ACCENT,
  calculateTargetKcal,
  classifyEnergyBalance,
  suggestMacroSplit,
  macroKcal,
  type DietPhase,
  type DietSpeed,
} from "@/lib/diet-calc";
import { ChipGroup } from "@/components/ui";
import { InsertRecommendationButton } from "@/components/insert-recommendation-button";
import { createPlan, updatePlan, type PlanInput } from "./actions";
import type { Tables } from "@/lib/database.types";

type Plan = Tables<"diet_plans">;
type Recommendation = Tables<"recommendations">;

const BALANCE_LABELS = { ipocalorica: "Ipocalorica", normocalorica: "Normocalorica", ipercalorica: "Ipercalorica" };

export function PlanForm({
  clientId,
  plan,
  weightKg,
  heightCm,
  defaultActivityLevel,
  age,
  gender,
  recommendations,
  bmrOverride,
  onDone,
  onCancel,
}: {
  clientId: string;
  plan: Plan | null;
  weightKg: number | null;
  heightCm: number | null;
  defaultActivityLevel: string | null;
  age: number | null;
  gender: Gender | null;
  recommendations: Recommendation[];
  bmrOverride?: { value: number; label: string } | null;
  onDone: (planId: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(plan?.name ?? "");
  const [phase, setPhase] = useState<DietPhase | "">((plan?.phase as DietPhase | null) ?? "perdita_peso");
  const [speed, setSpeed] = useState<DietSpeed>("standard");
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [startDate, setStartDate] = useState(plan?.start_date ?? new Date().toISOString().slice(0, 10));
  const [durationWeeks, setDurationWeeks] = useState(plan?.duration_weeks ?? 4);
  const [macroOnly, setMacroOnly] = useState(plan?.macro_only ?? false);

  const [weight, setWeight] = useState(weightKg ?? 70);
  const [height, setHeight] = useState(heightCm ?? 170);
  const [activityLevel, setActivityLevel] = useState(defaultActivityLevel ?? "sedentario");
  const [variationOverride, setVariationOverride] = useState<number | null>(
    plan && plan.tdee && plan.target_kcal ? Math.round(((plan.target_kcal - plan.tdee) / plan.tdee) * 1000) / 10 : null
  );

  const [proteinG, setProteinG] = useState<number | null>(plan?.target_protein_g ?? null);
  const [fatG, setFatG] = useState<number | null>(plan?.target_fat_g ?? null);
  const [carbsG, setCarbsG] = useState<number | null>(plan?.target_carbs_g ?? null);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const bmr = useMemo(() => {
    if (bmrOverride) return bmrOverride.value;
    if (!gender || age === null) return null;
    return calculateBMR(weight, height, age, gender);
  }, [bmrOverride, weight, height, age, gender]);

  const tdee = useMemo(() => (bmr !== null ? bmr * ACTIVITY_MULTIPLIERS[activityLevel] : null), [bmr, activityLevel]);

  const variationPercent =
    variationOverride !== null ? variationOverride : phase ? PHASE_SPEED_VARIATION[phase][speed] : 0;

  const targetKcal = tdee !== null ? Math.round(calculateTargetKcal(tdee, variationPercent)) : null;
  const balance = classifyEnergyBalance(variationPercent);

  const suggestedMacro = useMemo(() => {
    if (targetKcal === null) return null;
    return suggestMacroSplit(targetKcal, weight, phase || null);
  }, [targetKcal, weight, phase]);

  const effectiveProtein = proteinG ?? suggestedMacro?.proteinG ?? 0;
  const effectiveFat = fatG ?? suggestedMacro?.fatG ?? 0;
  const effectiveCarbs = carbsG ?? suggestedMacro?.carbsG ?? 0;
  const macroTotalKcal = macroKcal({ proteinG: effectiveProtein, fatG: effectiveFat, carbsG: effectiveCarbs });

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  const endDateLabel = useMemo(() => {
    const d = new Date(startDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + durationWeeks * 7);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, [startDate, durationWeeks]);

  function save() {
    if (!name.trim()) {
      setError("Il nome del piano è obbligatorio.");
      return;
    }
    const input: PlanInput = {
      name,
      phase: phase || null,
      notes: notes || null,
      start_date: startDate,
      duration_weeks: durationWeeks,
      macro_only: macroOnly,
      bmr: bmr !== null ? Math.round(bmr) : null,
      tdee: tdee !== null ? Math.round(tdee) : null,
      pal: ACTIVITY_MULTIPLIERS[activityLevel] ?? null,
      target_kcal: targetKcal,
      target_protein_g: Math.round(effectiveProtein),
      target_carbs_g: Math.round(effectiveCarbs),
      target_fat_g: Math.round(effectiveFat),
    };

    startTransition(async () => {
      const result = plan ? await updatePlan(clientId, plan.id, input) : await createPlan(clientId, input);
      if (result.error) setError(result.error);
      else onDone(plan?.id ?? ("planId" in result ? (result.planId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">{plan ? "Modifica piano" : "Nuovo piano alimentare"}</div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-teal-soft-line bg-teal-soft px-3.5 py-3">
        <label className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-teal" htmlFor="plan-name">
          <NotebookPen size={12} strokeWidth={2.4} />
          Nome piano
        </label>
        <input
          id="plan-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Definizione autunno"
          className="w-full rounded-md border border-teal-soft-line bg-surface px-2.5 py-1.5 text-[14px] font-medium outline-none focus:border-teal"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-cream px-3.5 py-3">
          <label className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint" htmlFor="plan-start">
            <CalendarDays size={12} strokeWidth={2.4} />
            Inizio
          </label>
          <input
            id="plan-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[13px] outline-none focus:border-teal"
          />
        </div>
        <div className="rounded-xl border border-line bg-cream px-3.5 py-3">
          <label className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint" htmlFor="plan-duration">
            <Hourglass size={12} strokeWidth={2.4} />
            Durata
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="plan-duration"
              type="number"
              min={1}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-[13px] outline-none focus:border-teal"
            />
            <span className="shrink-0 text-[11px] text-ink-faint">sett.</span>
          </div>
        </div>
        <div className="rounded-xl border border-gold bg-gold-soft px-3.5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-gold-ink">
            <FlagTriangleRight size={12} strokeWidth={2.4} />
            Fine prevista
          </div>
          <div className="py-1.5 text-[14px] font-semibold text-gold-ink">{endDateLabel ?? "—"}</div>
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Fase obiettivo</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(PHASE_LABELS) as [DietPhase, string][]).map(([key, label]) => {
            const accent = PHASE_ACCENT[key];
            const selected = phase === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPhase(key);
                  setVariationOverride(null);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  selected ? `${accent.border} ${accent.bg} ${accent.text}` : "border-line bg-surface text-ink-soft"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Velocità</span>
        <ChipGroup
          value={speed}
          onChange={(v) => {
            setSpeed(v as DietSpeed);
            setVariationOverride(null);
          }}
          options={Object.entries(SPEED_LABELS).map(([key, label]) => ({ key, label }))}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="plan-weight">
            Peso (kg)
          </label>
          <input
            id="plan-weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="plan-height">
            Altezza (cm)
          </label>
          <input
            id="plan-height"
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="plan-activity">
            Livello attività (PAL)
          </label>
          <select
            id="plan-activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className={inputClass}
          >
            {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-lg border border-teal-soft-line bg-teal-soft px-3.5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-teal">
            <Flame size={12} strokeWidth={2.4} />
            BMR (basale)
          </div>
          <div className="font-display text-xl font-bold">{bmr !== null ? Math.round(bmr) : "—"} kcal</div>
          {bmrOverride ? (
            <div className="mt-1 text-[10.5px] text-teal">Formula: {bmrOverride.label}</div>
          ) : (
            (!gender || age === null) && <div className="mt-1 text-[11px] text-gold-ink">Servono sesso e data di nascita</div>
          )}
        </div>
        <div className="rounded-lg border border-teal-soft-line bg-teal-soft px-3.5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-teal">
            <Zap size={12} strokeWidth={2.4} />
            TDEE (mantenimento)
          </div>
          <div className="font-display text-xl font-bold">{tdee !== null ? Math.round(tdee) : "—"} kcal</div>
        </div>
        <div className={`rounded-lg border px-3.5 py-3 ${BALANCE_ACCENT[balance].border} ${BALANCE_ACCENT[balance].bg}`}>
          <div className={`mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${BALANCE_ACCENT[balance].text}`}>
            <Target size={12} strokeWidth={2.4} />
            Target calorico — {BALANCE_LABELS[balance]}
          </div>
          <div className="font-display text-xl font-bold">{targetKcal ?? "—"} kcal</div>
          <label className="mt-1.5 block text-[10.5px] text-ink-faint" htmlFor="plan-variation">
            Variazione % sul TDEE
          </label>
          <input
            id="plan-variation"
            type="number"
            value={variationOverride ?? variationPercent}
            onChange={(e) => setVariationOverride(Number(e.target.value))}
            className="w-full rounded-md border border-line bg-surface px-2 py-1 text-[13px] outline-none focus:border-teal"
          />
        </div>
      </div>

      <label
        htmlFor="plan-macro-only"
        className="mb-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-cream px-3.5 py-3"
      >
        <input
          id="plan-macro-only"
          type="checkbox"
          checked={macroOnly}
          onChange={(e) => setMacroOnly(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
        />
        <span className="text-[12.5px] text-ink-soft">
          <span className="font-semibold text-ink">Solo macro</span> — nessun piano pasti fisso, fissi i target e il
          cliente logga liberamente i cibi (stile diario alimentare).
        </span>
      </label>

      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className={`rounded-lg border px-3.5 py-3 ${MACRO_ACCENT.protein.border} ${MACRO_ACCENT.protein.bg}`}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${MACRO_ACCENT.protein.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${MACRO_ACCENT.protein.dot}`} />
              Proteine
            </span>
            <span className="text-[10.5px] text-ink-faint">{effectiveProtein * 4} kcal</span>
          </div>
          <input
            type="number"
            value={effectiveProtein}
            onChange={(e) => setProteinG(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className={`rounded-lg border px-3.5 py-3 ${MACRO_ACCENT.fat.border} ${MACRO_ACCENT.fat.bg}`}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${MACRO_ACCENT.fat.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${MACRO_ACCENT.fat.dot}`} />
              Grassi
            </span>
            <span className="text-[10.5px] text-ink-faint">{effectiveFat * 9} kcal</span>
          </div>
          <input type="number" value={effectiveFat} onChange={(e) => setFatG(Number(e.target.value))} className={inputClass} />
        </div>
        <div className={`rounded-lg border px-3.5 py-3 ${MACRO_ACCENT.carbs.border} ${MACRO_ACCENT.carbs.bg}`}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${MACRO_ACCENT.carbs.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${MACRO_ACCENT.carbs.dot}`} />
              Carboidrati
            </span>
            <span className="text-[10.5px] text-ink-faint">{effectiveCarbs * 4} kcal</span>
          </div>
          <input
            type="number"
            value={effectiveCarbs}
            onChange={(e) => setCarbsG(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {targetKcal !== null && Math.abs(macroTotalKcal - targetKcal) > 50 && (
        <p className="mb-4 text-[11.5px] text-gold-ink">
          Le kcal dai macro ({Math.round(macroTotalKcal)}) si scostano dal target ({targetKcal}) di più di 50 kcal.
        </p>
      )}

      <div className="mb-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-medium text-ink-soft" htmlFor="plan-notes">
            Note per il cliente (facoltativo)
          </label>
          <InsertRecommendationButton
            recommendations={recommendations}
            onInsert={(text) => setNotes((prev) => (prev ? `${prev}\n\n${text}` : text))}
          />
        </div>
        <textarea
          id="plan-notes"
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        <Sparkles size={16} strokeWidth={2.2} />
        {pending ? "Salvataggio…" : plan ? "Salva modifiche" : "Crea piano alimentare"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="mt-2 w-full rounded-xl py-2 text-center text-[13px] font-medium text-ink-faint hover:text-ink-soft"
      >
        Annulla
      </button>
    </div>
  );
}
