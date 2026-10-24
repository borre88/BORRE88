"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Settings2, Star } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { PHASE_LABELS, PHASE_ACCENT, type DietPhase } from "@/lib/diet-calc";
import { ChipGroup } from "@/components/ui";
import { DayTargetsTable } from "./day-targets-table";
import { WeeklyMealGrid } from "./weekly-meal-grid";
import { PlanNotesButton } from "./plan-notes-modal";

type Food = Tables<"foods">;
type MealItemAlternative = Tables<"diet_plan_meal_item_alternatives">;
type MealItem = Tables<"diet_plan_meal_items"> & { diet_plan_meal_item_alternatives: MealItemAlternative[] };
type Meal = Tables<"diet_plan_meals"> & { diet_plan_meal_items: MealItem[] };
type PlanDay = Tables<"diet_plan_days">;
type RecommendedSupplement = Tables<"diet_plan_recommended_supplements">;
type Plan = Tables<"diet_plans"> & {
  diet_plan_days: PlanDay[];
  diet_plan_meals: Meal[];
  diet_plan_recommended_supplements: RecommendedSupplement[];
};

type Supplement = Tables<"supplements">;
type Recommendation = Tables<"recommendations">;
type Recipe = Tables<"recipes">;
type Protocol = Tables<"protocols">;

export function DietPlanEditor({
  clientId,
  plans,
  foods,
  supplements,
  recipes,
  recommendations,
  protocols,
}: {
  clientId: string;
  plans: Plan[];
  foods: Food[];
  supplements: Supplement[];
  recipes: Recipe[];
  recommendations: Recommendation[];
  protocols: Protocol[];
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    plans.find((p) => p.active)?.id ?? plans[0]?.id ?? null
  );

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  const dayOverrides = useMemo(
    () => new Map((selectedPlan?.diet_plan_days ?? []).map((d) => [d.weekday, d])),
    [selectedPlan]
  );

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
        <p className="text-[12.5px] text-ink-faint">
          Nessun piano alimentare ancora per questo cliente: impostalo prima da Pianificazione.
        </p>
        <Link
          href={`/trainer/${clientId}/pianificazione`}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Settings2 size={13} strokeWidth={2.2} />
          Vai a Pianificazione
        </Link>
      </div>
    );
  }

  return (
    <div>
      {plans.length > 1 && (
        <div className="mb-4">
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
        </div>
      )}

      {selectedPlan && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3.5">
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
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <PlanNotesButton
                clientId={clientId}
                plan={selectedPlan}
                supplements={supplements}
                recommendations={recommendations}
                protocols={protocols}
              />
              <Link
                href={`/trainer/${clientId}/pianificazione`}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                <Settings2 size={12} strokeWidth={2.2} />
                Modifica target
              </Link>
            </div>
          </div>

          {selectedPlan.macro_only ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center text-[12.5px] text-ink-faint">
              Piano &quot;Solo macro&quot;: il cliente segue liberamente i target sopra, senza un piano pasti fisso.
            </div>
          ) : (
            <>
              <DayTargetsTable
                clientId={clientId}
                planId={selectedPlan.id}
                days={selectedPlan.diet_plan_days}
                defaultKcal={selectedPlan.target_kcal}
                defaultProtein={selectedPlan.target_protein_g}
                defaultCarbs={selectedPlan.target_carbs_g}
                defaultFat={selectedPlan.target_fat_g}
              />
              <WeeklyMealGrid
                clientId={clientId}
                planId={selectedPlan.id}
                meals={selectedPlan.diet_plan_meals}
                foods={foods}
                supplements={supplements}
                recipes={recipes}
                targetKcal={selectedPlan.target_kcal}
                targetProtein={selectedPlan.target_protein_g}
                targetCarbs={selectedPlan.target_carbs_g}
                targetFat={selectedPlan.target_fat_g}
                dayOverrides={dayOverrides}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
