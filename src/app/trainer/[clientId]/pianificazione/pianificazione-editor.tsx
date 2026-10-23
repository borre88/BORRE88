"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Star, ChefHat } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { Gender } from "@/lib/health-score";
import { PHASE_LABELS, PHASE_ACCENT, type DietPhase } from "@/lib/diet-calc";
import { ChipGroup } from "@/components/ui";
import { deletePlan, setPlanActive } from "@/app/trainer/[clientId]/diete/actions";
import { PlanForm } from "@/app/trainer/[clientId]/diete/plan-form";
import { EnergyMetabolismCard } from "./energy-metabolism-card";

type Plan = Tables<"diet_plans">;
type Recommendation = Tables<"recommendations">;

export function PianificazioneEditor({
  clientId,
  plans,
  recommendations,
  weightKg,
  heightCm,
  defaultActivityLevel,
  bodyFatPercent,
  measurementDate,
  age,
  gender,
}: {
  clientId: string;
  plans: Plan[];
  recommendations: Recommendation[];
  weightKg: number | null;
  heightCm: number | null;
  defaultActivityLevel: string | null;
  bodyFatPercent: number | null;
  measurementDate: string | null;
  age: number | null;
  gender: Gender | null;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    plans.find((p) => p.active)?.id ?? plans[0]?.id ?? null
  );
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [pending, startTransition] = useTransition();
  const [bmrChoice, setBmrChoice] = useState<{ value: number; label: string } | null>(null);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  const energyCard = (
    <EnergyMetabolismCard
      weightKg={weightKg}
      heightCm={heightCm}
      age={age}
      gender={gender}
      bodyFatPercent={bodyFatPercent}
      measurementDate={measurementDate}
      selectedLabel={bmrChoice?.label ?? null}
      onUseForPlanning={(value, label) => setBmrChoice({ value, label })}
    />
  );

  if (mode === "new") {
    return (
      <div>
        {energyCard}
        <PlanForm
          clientId={clientId}
          plan={null}
          weightKg={weightKg}
          heightCm={heightCm}
          defaultActivityLevel={defaultActivityLevel}
          age={age}
          gender={gender}
          recommendations={recommendations}
          bmrOverride={bmrChoice}
          onDone={(planId) => {
            setSelectedPlanId(planId);
            setMode("view");
          }}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  if (mode === "edit" && selectedPlan) {
    return (
      <div>
        {energyCard}
        <PlanForm
          clientId={clientId}
          plan={selectedPlan}
          weightKg={weightKg}
          heightCm={heightCm}
          defaultActivityLevel={defaultActivityLevel}
          age={age}
          gender={gender}
          recommendations={recommendations}
          bmrOverride={bmrChoice}
          onDone={() => setMode("view")}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  return (
    <div>
      {energyCard}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {plans.length > 0 && (
          <ChipGroup
            value={selectedPlanId ?? ""}
            onChange={setSelectedPlanId}
            options={plans.map((p) => ({
              key: p.id,
              label: (
                <span className="flex items-center gap-1">
                  {p.active && <Star size={11} strokeWidth={2.4} className="fill-current text-gold" />}
                  {p.name}
                </span>
              ),
            }))}
          />
        )}
        <button
          type="button"
          onClick={() => setMode("new")}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={13} strokeWidth={2.2} />
          Nuovo piano
        </button>
      </div>

      {!selectedPlan && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <p className="text-[12.5px] text-ink-faint">Nessun piano alimentare ancora per questo cliente.</p>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Crea il primo piano
          </button>
        </div>
      )}

      {selectedPlan && (
        <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center gap-1.5">
                {selectedPlan.phase &&
                  (() => {
                    const accent = PHASE_ACCENT[selectedPlan.phase as DietPhase];
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${accent.border} ${accent.bg} ${accent.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                        {PHASE_LABELS[selectedPlan.phase as DietPhase] ?? selectedPlan.phase}
                      </span>
                    );
                  })()}
                {selectedPlan.active && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold-ink">
                    <Star size={9} strokeWidth={3} className="fill-current" />
                    Attivo
                  </span>
                )}
              </div>
              <div className="font-display text-lg font-semibold">{selectedPlan.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                {selectedPlan.target_kcal ? `${selectedPlan.target_kcal} kcal` : "Target non impostato"}
                {selectedPlan.target_protein_g ? (
                  <>
                    {" · "}
                    <span className="text-teal">P {selectedPlan.target_protein_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {selectedPlan.target_carbs_g ? (
                  <>
                    {" · "}
                    <span className="text-gold-ink">C {selectedPlan.target_carbs_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {selectedPlan.target_fat_g ? (
                  <>
                    {" · "}
                    <span className="text-bad">G {selectedPlan.target_fat_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {" · "}
                dal {new Date(selectedPlan.start_date + "T00:00:00").toLocaleDateString("it-IT")} per{" "}
                {selectedPlan.duration_weeks} settimane
              </div>
              {selectedPlan.notes && <p className="mt-1.5 text-[12px] text-ink-soft">{selectedPlan.notes}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {!selectedPlan.active && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => setPlanActive(clientId, selectedPlan.id, true))}
                  className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                >
                  <Star size={12} strokeWidth={2.2} />
                  Rendi attivo
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                <Pencil size={12} strokeWidth={2.2} />
                Modifica
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Eliminare il piano "${selectedPlan.name}"?`)) {
                    const remaining = plans.filter((p) => p.id !== selectedPlan.id);
                    setSelectedPlanId(remaining.find((p) => p.active)?.id ?? remaining[0]?.id ?? null);
                    startTransition(() => deletePlan(clientId, selectedPlan.id));
                  }
                }}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
              >
                <Trash2 size={12} strokeWidth={2.2} />
                Elimina
              </button>
            </div>
          </div>

          {!selectedPlan.macro_only && (
            <Link
              href={`/trainer/${clientId}/diete`}
              className="mt-3.5 flex items-center justify-center gap-1.5 rounded-lg bg-teal py-2.5 text-[13px] font-semibold text-white"
            >
              <ChefHat size={15} strokeWidth={2.2} />
              Vai a costruire la dieta pasto per pasto
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
