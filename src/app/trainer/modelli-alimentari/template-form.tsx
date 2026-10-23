"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import { PHASE_LABELS, PHASE_ACCENT, MACRO_ACCENT, type DietPhase } from "@/lib/diet-calc";
import { InsertRecommendationButton } from "@/components/insert-recommendation-button";
import { createTemplate, updateTemplate, type TemplateInput } from "./actions";
import type { Tables } from "@/lib/database.types";

type Template = Tables<"diet_plans">;
type Recommendation = Tables<"recommendations">;

export function TemplateForm({
  template,
  recommendations,
  onDone,
  onCancel,
}: {
  template: Template | null;
  recommendations: Recommendation[];
  onDone: (templateId: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [phase, setPhase] = useState<DietPhase | "">((template?.phase as DietPhase | null) ?? "");
  const [notes, setNotes] = useState(template?.notes ?? "");
  const [durationWeeks, setDurationWeeks] = useState(template?.duration_weeks ?? 4);
  const [macroOnly, setMacroOnly] = useState(template?.macro_only ?? false);
  const [targetKcal, setTargetKcal] = useState(template?.target_kcal?.toString() ?? "");
  const [proteinG, setProteinG] = useState(template?.target_protein_g?.toString() ?? "");
  const [fatG, setFatG] = useState(template?.target_fat_g?.toString() ?? "");
  const [carbsG, setCarbsG] = useState(template?.target_carbs_g?.toString() ?? "");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function save() {
    if (!name.trim()) {
      setError("Il nome del modello è obbligatorio.");
      return;
    }
    const input: TemplateInput = {
      name,
      phase: phase || null,
      notes: notes || null,
      duration_weeks: durationWeeks,
      macro_only: macroOnly,
      target_kcal: targetKcal.trim() ? Number(targetKcal) : null,
      target_protein_g: proteinG.trim() ? Number(proteinG) : null,
      target_carbs_g: carbsG.trim() ? Number(carbsG) : null,
      target_fat_g: fatG.trim() ? Number(fatG) : null,
    };

    startTransition(async () => {
      const result = template ? await updateTemplate(template.id, input) : await createTemplate(input);
      if (result.error) setError(result.error);
      else onDone(template?.id ?? ("templateId" in result ? (result.templateId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">{template ? "Modifica modello" : "Nuovo modello alimentare"}</div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="tpl-name">
          Nome modello
        </label>
        <input
          id="tpl-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Definizione 1800 kcal - 3 pasti"
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Fase (facoltativo)</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(PHASE_LABELS) as [DietPhase, string][]).map(([key, label]) => {
            const accent = PHASE_ACCENT[key];
            const selected = phase === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPhase(selected ? "" : key)}
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

      <div className="mb-4 flex items-center gap-2">
        <input
          id="tpl-macro-only"
          type="checkbox"
          checked={macroOnly}
          onChange={(e) => setMacroOnly(e.target.checked)}
          className="h-4 w-4 accent-teal"
        />
        <label htmlFor="tpl-macro-only" className="text-xs text-ink-soft">
          Solo macro — nessun piano pasti nel modello
        </label>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="tpl-kcal">
            Kcal target
          </label>
          <input id="tpl-kcal" type="number" value={targetKcal} onChange={(e) => setTargetKcal(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-[10.5px] font-medium ${MACRO_ACCENT.protein.text}`} htmlFor="tpl-protein">
            Proteine (g)
          </label>
          <input id="tpl-protein" type="number" value={proteinG} onChange={(e) => setProteinG(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-[10.5px] font-medium ${MACRO_ACCENT.carbs.text}`} htmlFor="tpl-carbs">
            Carboidrati (g)
          </label>
          <input id="tpl-carbs" type="number" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={`mb-1 block text-[10.5px] font-medium ${MACRO_ACCENT.fat.text}`} htmlFor="tpl-fat">
            Grassi (g)
          </label>
          <input id="tpl-fat" type="number" value={fatG} onChange={(e) => setFatG(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="tpl-duration">
          Durata indicativa (settimane)
        </label>
        <input
          id="tpl-duration"
          type="number"
          min={1}
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(Number(e.target.value))}
          className={`${inputClass} max-w-[120px]`}
        />
      </div>

      <div className="mb-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-medium text-ink-soft" htmlFor="tpl-notes">
            Note (facoltativo)
          </label>
          <InsertRecommendationButton
            recommendations={recommendations}
            onInsert={(text) => setNotes((prev) => (prev ? `${prev}\n\n${text}` : text))}
          />
        </div>
        <textarea id="tpl-notes" value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} rows={4} className={inputClass} />
      </div>

      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Sparkles size={15} strokeWidth={2.2} />
          {pending ? "Salvataggio…" : template ? "Salva modifiche" : "Crea modello"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
