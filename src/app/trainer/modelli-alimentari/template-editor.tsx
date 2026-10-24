"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Send } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { PHASE_LABELS, PHASE_ACCENT, type DietPhase } from "@/lib/diet-calc";
import { ChipGroup } from "@/components/ui";
import { DayTargetsTable } from "@/app/trainer/[clientId]/diete/day-targets-table";
import { WeeklyMealGrid } from "@/app/trainer/[clientId]/diete/weekly-meal-grid";
import { PlanNotesButton } from "@/app/trainer/[clientId]/diete/plan-notes-modal";
import { deleteTemplate } from "./actions";
import { TemplateForm } from "./template-form";
import { AssignModal } from "./assign-modal";

type Food = Tables<"foods">;
type Supplement = Tables<"supplements">;
type Recommendation = Tables<"recommendations">;
type Recipe = Tables<"recipes">;
type Protocol = Tables<"protocols">;
type MealItemAlternative = Tables<"diet_plan_meal_item_alternatives">;
type MealItem = Tables<"diet_plan_meal_items"> & { diet_plan_meal_item_alternatives: MealItemAlternative[] };
type Meal = Tables<"diet_plan_meals"> & { diet_plan_meal_items: MealItem[] };
type PlanDay = Tables<"diet_plan_days">;
type RecommendedSupplement = Tables<"diet_plan_recommended_supplements">;
type Template = Tables<"diet_plans"> & {
  diet_plan_days: PlanDay[];
  diet_plan_meals: Meal[];
  diet_plan_recommended_supplements: RecommendedSupplement[];
};
interface ClientOption {
  id: string;
  full_name: string;
}

export function TemplateEditor({
  templates,
  foods,
  clients,
  supplements,
  recipes,
  recommendations,
  protocols,
}: {
  templates: Template[];
  foods: Food[];
  clients: ClientOption[];
  supplements: Supplement[];
  recipes: Recipe[];
  recommendations: Recommendation[];
  protocols: Protocol[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [assigning, setAssigning] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) ?? null, [templates, selectedId]);

  const dayOverrides = useMemo(
    () => new Map((selected?.diet_plan_days ?? []).map((d) => [d.weekday, d])),
    [selected]
  );

  if (mode === "new") {
    return (
      <TemplateForm
        template={null}
        recommendations={recommendations}
        onDone={(id) => {
          setSelectedId(id);
          setMode("view");
        }}
        onCancel={() => setMode("view")}
      />
    );
  }

  if (mode === "edit" && selected) {
    return (
      <TemplateForm
        template={selected}
        recommendations={recommendations}
        onDone={() => setMode("view")}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {templates.length > 0 && (
          <ChipGroup
            value={selectedId ?? ""}
            onChange={setSelectedId}
            options={templates.map((t) => ({ key: t.id, label: t.name }))}
          />
        )}
        <button
          type="button"
          onClick={() => setMode("new")}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={13} strokeWidth={2.2} />
          Nuovo modello
        </button>
      </div>

      {!selected && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <p className="text-[12.5px] text-ink-faint">Nessun modello alimentare ancora.</p>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Crea il primo modello
          </button>
        </div>
      )}

      {selected && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3.5">
            <div>
              {selected.phase && (
                <div className="mb-1">
                  {(() => {
                    const accent = PHASE_ACCENT[selected.phase as DietPhase];
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${accent.border} ${accent.bg} ${accent.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                        {PHASE_LABELS[selected.phase as DietPhase] ?? selected.phase}
                      </span>
                    );
                  })()}
                </div>
              )}
              <div className="font-display text-lg font-semibold">{selected.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                {selected.target_kcal ? `${selected.target_kcal} kcal` : "Target non impostato"}
                {selected.target_protein_g ? (
                  <>
                    {" · "}
                    <span className="text-teal">P {selected.target_protein_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {selected.target_carbs_g ? (
                  <>
                    {" · "}
                    <span className="text-gold-ink">C {selected.target_carbs_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {selected.target_fat_g ? (
                  <>
                    {" · "}
                    <span className="text-bad">G {selected.target_fat_g}g</span>
                  </>
                ) : (
                  ""
                )}
                {" · "}
                {selected.duration_weeks} settimane
              </div>
              {selected.notes && <p className="mt-1.5 text-[12px] text-ink-soft">{selected.notes}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <PlanNotesButton
                clientId={selected.id}
                plan={selected}
                supplements={supplements}
                recommendations={recommendations}
                protocols={protocols}
              />
              <button
                type="button"
                disabled={clients.length === 0}
                onClick={() => setAssigning(true)}
                className="flex items-center gap-1 rounded-md bg-teal px-2.5 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
              >
                <Send size={12} strokeWidth={2.2} />
                Assegna a cliente
              </button>
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
                  if (confirm(`Eliminare il modello "${selected.name}"?`)) {
                    const remaining = templates.filter((t) => t.id !== selected.id);
                    setSelectedId(remaining[0]?.id ?? null);
                    startTransition(() => deleteTemplate(selected.id));
                  }
                }}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
              >
                <Trash2 size={12} strokeWidth={2.2} />
                Elimina
              </button>
            </div>
          </div>

          {selected.macro_only ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center text-[12.5px] text-ink-faint">
              Modello &quot;Solo macro&quot;: nessun piano pasti fisso, solo i target sopra.
            </div>
          ) : (
            <>
              <DayTargetsTable
                clientId={selected.id}
                planId={selected.id}
                days={selected.diet_plan_days}
                defaultKcal={selected.target_kcal}
                defaultProtein={selected.target_protein_g}
                defaultCarbs={selected.target_carbs_g}
                defaultFat={selected.target_fat_g}
              />
              <WeeklyMealGrid
                clientId={selected.id}
                planId={selected.id}
                meals={selected.diet_plan_meals}
                foods={foods}
                supplements={supplements}
                recipes={recipes}
                targetKcal={selected.target_kcal}
                targetProtein={selected.target_protein_g}
                targetCarbs={selected.target_carbs_g}
                targetFat={selected.target_fat_g}
                dayOverrides={dayOverrides}
              />
            </>
          )}
        </div>
      )}

      {assigning && selected && (
        <AssignModal
          templateId={selected.id}
          templateName={selected.name}
          clients={clients}
          onClose={() => setAssigning(false)}
        />
      )}
    </div>
  );
}
