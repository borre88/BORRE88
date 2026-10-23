"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Layers, Check } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { PHASE_LABELS, PHASE_ACCENT, MACRO_ACCENT, type DietPhase } from "@/lib/diet-calc";
import { assignTemplateToClient } from "@/app/trainer/modelli-alimentari/actions";

type Template = Pick<
  Tables<"diet_plans">,
  "id" | "name" | "phase" | "duration_weeks" | "macro_only" | "target_kcal" | "target_protein_g" | "target_carbs_g" | "target_fat_g"
>;

export function DietTemplatePicker({
  clientId,
  templates,
  onAssigned,
}: {
  clientId: string;
  templates: Template[];
  onAssigned: (planId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) ?? null, [templates, selectedId]);

  const macroPct = useMemo(() => {
    if (!selected?.target_kcal) return null;
    const p = selected.target_protein_g ?? 0;
    const c = selected.target_carbs_g ?? 0;
    const f = selected.target_fat_g ?? 0;
    const kcal = p * 4 + c * 4 + f * 9;
    if (kcal === 0) return null;
    return {
      protein: Math.round(((p * 4) / kcal) * 100),
      carbs: Math.round(((c * 4) / kcal) * 100),
      fat: Math.round(((f * 9) / kcal) * 100),
    };
  }, [selected]);

  function useTemplate() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await assignTemplateToClient(selected.id, clientId, { startDate, setActive: true });
      if (result.error) setError(result.error);
      else if (result.planId) onAssigned(result.planId);
    });
  }

  if (templates.length === 0) {
    return (
      <div className="mb-5 rounded-xl border border-dashed border-line bg-surface px-5 py-5 text-center text-[12.5px] text-ink-faint">
        Non hai ancora modelli alimentari salvati.{" "}
        <Link href="/trainer/modelli-alimentari" className="font-medium text-teal underline">
          Creane uno da Modelli alimentari
        </Link>{" "}
        per poterlo riusare qui.
      </div>
    );
  }

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Layers size={17} strokeWidth={2.2} />
        </span>
        <div>
          <div className="font-display text-[15px] font-bold">Modello di Dieta</div>
          <div className="text-[11.5px] text-ink-faint">Parti da un modello già pronto invece che da zero</div>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-3">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              selectedId === t.id ? "border-teal bg-teal text-white" : "border-line bg-cream text-ink-soft"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="px-4 pb-4">
          <div className="rounded-lg border border-teal-soft-line bg-teal-soft px-3.5 py-3">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {selected.phase && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${PHASE_ACCENT[selected.phase as DietPhase].border} ${PHASE_ACCENT[selected.phase as DietPhase].bg} ${PHASE_ACCENT[selected.phase as DietPhase].text}`}
                >
                  {PHASE_LABELS[selected.phase as DietPhase] ?? selected.phase}
                </span>
              )}
              <span className="text-[11px] text-ink-faint">
                {selected.duration_weeks} settimane {selected.macro_only ? "· solo macro" : ""}
              </span>
            </div>
            {selected.target_kcal ? (
              <div className="flex flex-wrap items-center gap-3 text-[12px]">
                <span className="font-semibold">{selected.target_kcal} kcal</span>
                {macroPct && (
                  <>
                    <span className={MACRO_ACCENT.protein.text}>P {macroPct.protein}%</span>
                    <span className={MACRO_ACCENT.carbs.text}>C {macroPct.carbs}%</span>
                    <span className={MACRO_ACCENT.fat.text}>G {macroPct.fat}%</span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">Target non impostato nel modello.</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-medium text-ink-faint">Inizio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-line bg-cream px-2.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
              />
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={useTemplate}
              className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60"
            >
              <Check size={14} strokeWidth={2.2} />
              {pending ? "Creazione…" : `Usa "${selected.name}" per questo piano`}
            </button>
          </div>
          {error && <p className="mt-2 text-[11.5px] font-medium text-bad">{error}</p>}
        </div>
      )}
    </div>
  );
}
