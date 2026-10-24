"use client";

import { useMemo, useState, useTransition } from "react";
import { X, ChevronUp, ChevronDown, Trash2, Scale, Wand2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { EQUIVALENCE_LABELS, equivalenceAccent, type EquivalenceType } from "@/lib/diet-calc";
import {
  addMealItemAlternative,
  updateMealItemAlternativeQuantity,
  updateMealItemAlternativeEquivalence,
  removeMealItemAlternative,
  rebalanceMealItemAlternatives,
  roundMealItemAlternatives,
  swapMealItemAlternativePosition,
} from "./actions";

type Food = Tables<"foods">;
type MealItemAlternative = Tables<"diet_plan_meal_item_alternatives">;
type MealItem = Tables<"diet_plan_meal_items"> & { diet_plan_meal_item_alternatives: MealItemAlternative[] };

const EQUIVALENCE_TYPES: EquivalenceType[] = ["kcal", "protein", "carbs", "fat"];

export function ManageAlternativesModal({
  clientId,
  item,
  originalFood,
  foods,
  foodsById,
  onClose,
}: {
  clientId: string;
  item: MealItem;
  originalFood: Food;
  foods: Food[];
  foodsById: Map<string, Food>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [addEquivalence, setAddEquivalence] = useState<EquivalenceType>("kcal");
  const [pending, startTransition] = useTransition();

  const alternatives = useMemo(
    () => [...item.diet_plan_meal_item_alternatives].sort((a, b) => a.position - b.position),
    [item.diet_plan_meal_item_alternatives]
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const usedFoodIds = new Set(alternatives.map((a) => a.food_id));
    return foods.filter((f) => f.id !== originalFood.id && !usedFoodIds.has(f.id) && f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [foods, query, originalFood.id, alternatives]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-xl"
      >
        <div className="border-b border-line bg-teal-soft px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-display text-[16px] font-bold">Gestisci alternative</div>
              <div className="text-[11.5px] text-ink-faint">
                Per: {originalFood.name} ({item.quantity_g}g)
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Chiudi" className="shrink-0 text-ink-faint hover:text-ink">
              <X size={17} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Sostituzioni attuali
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={pending || alternatives.length === 0}
                onClick={() => startTransition(() => roundMealItemAlternatives(clientId, item.id, 5))}
                className="flex items-center gap-1 text-[11px] font-medium text-teal disabled:opacity-40"
              >
                <Wand2 size={11} strokeWidth={2.2} />
                Arrotonda
              </button>
              <button
                type="button"
                disabled={pending || alternatives.length === 0}
                onClick={() => startTransition(() => rebalanceMealItemAlternatives(clientId, item.id))}
                className="flex items-center gap-1 text-[11px] font-medium text-teal disabled:opacity-40"
              >
                <Scale size={11} strokeWidth={2.2} />
                Bilancia Equivalenti
              </button>
            </div>
          </div>

          {alternatives.length === 0 ? (
            <p className="mb-4 text-[11.5px] text-ink-faint">Nessuna alternativa per questo alimento.</p>
          ) : (
            <div className="mb-4 space-y-2">
              {alternatives.map((alt, i) => {
                const altFood = foodsById.get(alt.food_id);
                const accent = equivalenceAccent(alt.equivalence_type as EquivalenceType);
                return (
                  <div key={alt.id} className="rounded-lg border border-line bg-cream px-3 py-2.5">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-semibold">{altFood?.name ?? "Alimento"}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => startTransition(() => swapMealItemAlternativePosition(clientId, item.id, alt.id, "up"))}
                          aria-label="Sposta su"
                          className="text-ink-faint hover:text-teal disabled:opacity-30"
                        >
                          <ChevronUp size={13} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          disabled={i === alternatives.length - 1}
                          onClick={() => startTransition(() => swapMealItemAlternativePosition(clientId, item.id, alt.id, "down"))}
                          aria-label="Sposta giù"
                          className="text-ink-faint hover:text-teal disabled:opacity-30"
                        >
                          <ChevronDown size={13} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startTransition(() => removeMealItemAlternative(clientId, alt.id))}
                          aria-label="Rimuovi alternativa"
                          className="ml-1 text-ink-faint hover:text-bad"
                        >
                          <Trash2 size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={alt.quantity_g}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v > 0) startTransition(() => updateMealItemAlternativeQuantity(clientId, alt.id, v));
                        }}
                        className="w-16 rounded border border-line bg-surface px-1.5 py-1 text-[12px] outline-none focus:border-teal"
                      />
                      <span className="text-[10.5px] text-ink-faint">g · Eq:</span>
                      <span className={`rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold uppercase ${accent.bg} ${accent.border} ${accent.text}`}>
                        {EQUIVALENCE_LABELS[alt.equivalence_type as EquivalenceType] ?? alt.equivalence_type}
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {EQUIVALENCE_TYPES.map((t) => {
                        const tAccent = equivalenceAccent(t);
                        const active = alt.equivalence_type === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              startTransition(() => updateMealItemAlternativeEquivalence(clientId, alt.id, item.id, t))
                            }
                            className={`rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase ${
                              active ? `${tAccent.bg} ${tAccent.border} ${tAccent.text}` : "border-line bg-surface text-ink-faint"
                            }`}
                          >
                            {t === "kcal" ? "KCAL" : t === "protein" ? "PROT" : t === "carbs" ? "CARB" : "FAT"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-line pt-3.5">
            <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Aggiungi nuova sostituzione
            </span>
            <p className="mb-1.5 text-[10.5px] text-ink-faint">Tipo equivalenza</p>
            <div className="mb-2 flex gap-1.5">
              {EQUIVALENCE_TYPES.map((t) => {
                const tAccent = equivalenceAccent(t);
                const active = addEquivalence === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddEquivalence(t)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      active ? `${tAccent.bg} ${tAccent.border} ${tAccent.text}` : "border-line bg-cream text-ink-soft"
                    }`}
                  >
                    {EQUIVALENCE_LABELS[t]}
                  </button>
                );
              })}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca alimento da aggiungere…"
              className="mb-1.5 w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[12px] outline-none focus:border-teal"
            />
            {matches.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-line bg-cream">
                {matches.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      startTransition(() => addMealItemAlternative(clientId, item.id, f.id, addEquivalence));
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[12px] hover:bg-teal-soft disabled:opacity-50"
                  >
                    <span>{f.name}</span>
                    <span className="text-[10.5px] text-ink-faint">{f.kcal_100g} kcal/100g</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
