"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Copy, X, Repeat, Files } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS_SHORT,
  MACRO_ACCENT,
  PROTEIN_SOURCE_ACCENT,
  type ProteinSource,
  proteinSourceAccent,
  proteinSourceLabel,
  scaleFoodToQuantity,
  scaleRecipeToPortions,
  mealTypeDotClass,
  todayWeekdayMon0,
} from "@/lib/diet-calc";
import {
  addMeal,
  deleteMeal,
  addMealItem,
  updateMealItemQuantity,
  updateMealItemUnit,
  deleteMealItem,
  replaceMealItemFood,
  duplicateMealItem,
  setMealItemAlternatives,
  copyDayToWeekdays,
} from "./actions";

type Food = Tables<"foods">;
type Supplement = Tables<"supplements">;
type Recipe = Tables<"recipes">;
type MealItem = Tables<"diet_plan_meal_items">;
type Meal = Tables<"diet_plan_meals"> & { diet_plan_meal_items: MealItem[] };

export function WeeklyMealGrid({
  clientId,
  planId,
  meals,
  foods,
  supplements = [],
  recipes = [],
  targetKcal,
  targetProtein,
  targetCarbs,
  targetFat,
  dayOverrides,
}: {
  clientId: string;
  planId: string;
  meals: Meal[];
  foods: Food[];
  supplements?: Supplement[];
  recipes?: Recipe[];
  targetKcal: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  dayOverrides: Map<number, Tables<"diet_plan_days">>;
}) {
  const [pending, startTransition] = useTransition();
  const [copyFrom, setCopyFrom] = useState(0);
  const [copyTo, setCopyTo] = useState<Set<number>>(new Set());
  const today = useMemo(() => todayWeekdayMon0(), []);

  const foodsById = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  const recipesById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const mealTypeRows = useMemo(() => {
    const present = new Set(meals.map((m) => m.meal_type));
    const ordered = MEAL_TYPES.map((m) => m.key).filter((k) => present.has(k));
    const extra = Array.from(present).filter((k) => !MEAL_TYPES.some((m) => m.key === k));
    return [...ordered, ...extra];
  }, [meals]);

  function mealAt(weekday: number, mealType: string) {
    return meals.find((m) => m.weekday === weekday && m.meal_type === mealType) ?? null;
  }

  function dayTotals(weekday: number) {
    const dayMeals = meals.filter((m) => m.weekday === weekday);
    let kcal = 0,
      protein = 0,
      carbs = 0,
      fat = 0;
    for (const meal of dayMeals) {
      for (const item of meal.diet_plan_meal_items) {
        if (item.food_id) {
          const food = foodsById.get(item.food_id);
          if (!food) continue;
          const scaled = scaleFoodToQuantity(food, item.quantity_g);
          kcal += scaled.kcal;
          protein += scaled.protein;
          carbs += scaled.carbs;
          fat += scaled.fat;
        } else if (item.recipe_id) {
          const recipe = recipesById.get(item.recipe_id);
          if (!recipe) continue;
          const scaled = scaleRecipeToPortions(recipe, item.quantity_g);
          kcal += scaled.kcal;
          protein += scaled.protein;
          carbs += scaled.carbs;
          fat += scaled.fat;
        }
      }
    }
    return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }

  const weeklyTotals = useMemo(() => {
    let kcal = 0,
      protein = 0,
      carbs = 0,
      fat = 0,
      daysWithTarget = 0,
      kcalTarget = 0,
      proteinTarget = 0,
      carbsTarget = 0,
      fatTarget = 0;
    for (let weekday = 0; weekday < 7; weekday++) {
      const t = dayTotals(weekday);
      kcal += t.kcal;
      protein += t.protein;
      carbs += t.carbs;
      fat += t.fat;
      const override = dayOverrides.get(weekday);
      const dKcal = override?.target_kcal ?? targetKcal;
      const dProtein = override?.target_protein_g ?? targetProtein;
      const dCarbs = override?.target_carbs_g ?? targetCarbs;
      const dFat = override?.target_fat_g ?? targetFat;
      if (dKcal) {
        daysWithTarget++;
        kcalTarget += dKcal;
        proteinTarget += dProtein ?? 0;
        carbsTarget += dCarbs ?? 0;
        fatTarget += dFat ?? 0;
      }
    }
    return { kcal, protein, carbs, fat, kcalTarget, proteinTarget, carbsTarget, fatTarget, daysWithTarget };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals, foodsById, recipesById, dayOverrides, targetKcal, targetProtein, targetCarbs, targetFat]);

  const proteinSourceCounts = useMemo(() => {
    const counts = new Map<ProteinSource, number>();
    for (const meal of meals) {
      for (const item of meal.diet_plan_meal_items) {
        if (!item.food_id) continue;
        const food = foodsById.get(item.food_id);
        const source = food?.protein_source as ProteinSource | null | undefined;
        if (!source) continue;
        counts.set(source, (counts.get(source) ?? 0) + 1);
      }
    }
    return counts;
  }, [meals, foodsById]);

  function addMealTypeRow() {
    const remaining = MEAL_TYPES.filter((m) => !mealTypeRows.includes(m.key));
    if (remaining.length === 0) return;
    startTransition(() => addMeal(clientId, planId, 0, remaining[0].key, null));
  }

  function toggleCopyTo(weekday: number) {
    setCopyTo((prev) => {
      const next = new Set(prev);
      if (next.has(weekday)) next.delete(weekday);
      else next.add(weekday);
      return next;
    });
  }

  return (
    <div>
      <WeeklyRecapPanel totals={weeklyTotals} proteinSourceCounts={proteinSourceCounts} />

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2.5">
        <Copy size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
        <span className="text-[12px] text-ink-soft">Copia</span>
        <select
          value={copyFrom}
          onChange={(e) => setCopyFrom(Number(e.target.value))}
          className="rounded border border-line bg-surface px-1.5 py-1 text-[12px]"
        >
          {WEEKDAY_LABELS_SHORT.map((w, i) => (
            <option key={i} value={i}>
              {w}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-ink-soft">su:</span>
        {WEEKDAY_LABELS_SHORT.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleCopyTo(i)}
            disabled={i === copyFrom}
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium disabled:opacity-30 ${
              copyTo.has(i) ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
            }`}
          >
            {w}
          </button>
        ))}
        <button
          type="button"
          disabled={pending || copyTo.size === 0}
          onClick={() =>
            startTransition(() => copyDayToWeekdays(clientId, planId, copyFrom, Array.from(copyTo)))
          }
          className="ml-auto rounded-md bg-teal px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
        >
          Applica
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[920px] border-collapse text-[12px]">
          <thead>
            <tr className="bg-cream">
              <th className="w-32 px-3 py-2 text-left text-[10.5px] font-semibold text-ink-faint">Pasto</th>
              {WEEKDAY_LABELS_SHORT.map((w, weekday) => (
                <th
                  key={w}
                  className={`min-w-[150px] px-2 py-2 text-left text-[10.5px] font-semibold ${
                    weekday === today ? "text-teal" : "text-ink-faint"
                  }`}
                >
                  {w}
                  {weekday === today && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypeRows.map((mealType) => (
              <tr key={mealType} className="border-t border-line align-top">
                <td className="px-3 py-2 font-medium text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${mealTypeDotClass(mealType)}`} />
                    {MEAL_TYPE_LABELS[mealType] ?? mealType}
                  </span>
                </td>
                {WEEKDAY_LABELS_SHORT.map((_, weekday) => {
                  const meal = mealAt(weekday, mealType);
                  return (
                    <td key={weekday} className={`px-2 py-2 ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                      {meal ? (
                        <MealCell
                          clientId={clientId}
                          meal={meal}
                          foods={foods}
                          foodsById={foodsById}
                          supplements={supplements}
                          recipes={recipes}
                          recipesById={recipesById}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startTransition(() => addMeal(clientId, planId, weekday, mealType, null))}
                          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-line py-3 text-[11px] text-ink-faint hover:border-teal hover:text-teal"
                        >
                          <Plus size={12} strokeWidth={2.2} />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-line bg-cream font-semibold">
              <td className="px-3 py-2">Totale kcal</td>
              {WEEKDAY_LABELS_SHORT.map((_, weekday) => {
                const totals = dayTotals(weekday);
                const override = dayOverrides.get(weekday);
                const kcalTarget = override?.target_kcal ?? targetKcal;
                return (
                  <td key={weekday} className={`px-2 py-2 ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                    {totals.kcal} {kcalTarget ? <span className="font-normal text-ink-faint">/ {kcalTarget}</span> : null}
                  </td>
                );
              })}
            </tr>
            <tr className="text-[11px]">
              <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.protein.text}`}>Proteine (g)</td>
              {WEEKDAY_LABELS_SHORT.map((_, weekday) => {
                const totals = dayTotals(weekday);
                const override = dayOverrides.get(weekday);
                const t = override?.target_protein_g ?? targetProtein;
                return (
                  <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.protein.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                    {totals.protein}
                    {t ? ` / ${t}` : ""}
                  </td>
                );
              })}
            </tr>
            <tr className="text-[11px]">
              <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.carbs.text}`}>Carboidrati (g)</td>
              {WEEKDAY_LABELS_SHORT.map((_, weekday) => {
                const totals = dayTotals(weekday);
                const override = dayOverrides.get(weekday);
                const t = override?.target_carbs_g ?? targetCarbs;
                return (
                  <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.carbs.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                    {totals.carbs}
                    {t ? ` / ${t}` : ""}
                  </td>
                );
              })}
            </tr>
            <tr className="text-[11px]">
              <td className={`px-3 py-1 font-medium ${MACRO_ACCENT.fat.text}`}>Grassi (g)</td>
              {WEEKDAY_LABELS_SHORT.map((_, weekday) => {
                const totals = dayTotals(weekday);
                const override = dayOverrides.get(weekday);
                const t = override?.target_fat_g ?? targetFat;
                return (
                  <td key={weekday} className={`px-2 py-1 ${MACRO_ACCENT.fat.text} ${weekday === today ? "bg-teal-soft/40" : ""}`}>
                    {totals.fat}
                    {t ? ` / ${t}` : ""}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addMealTypeRow}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-teal"
      >
        <Plus size={13} strokeWidth={2.2} />
        Aggiungi pasto
      </button>
    </div>
  );
}

/** Pannello colorato sopra la griglia: totali settimanali vs target (ring kcal + barre macro) e distribuzione fonti proteiche. */
function WeeklyRecapPanel({
  totals,
  proteinSourceCounts,
}: {
  totals: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    kcalTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
    daysWithTarget: number;
  };
  proteinSourceCounts: Map<ProteinSource, number>;
}) {
  const proteinKcal = totals.protein * 4;
  const carbsKcal = totals.carbs * 4;
  const fatKcal = totals.fat * 9;
  const macroKcalSum = proteinKcal + carbsKcal + fatKcal || 1;
  const proteinPct = (proteinKcal / macroKcalSum) * 100;
  const carbsPct = (carbsKcal / macroKcalSum) * 100;

  const ringStyle = {
    background: `conic-gradient(var(--brand) 0% ${proteinPct}%, var(--gold) ${proteinPct}% ${proteinPct + carbsPct}%, var(--negative) ${proteinPct + carbsPct}% 100%)`,
  };

  const bars = [
    { label: "Energia", unit: "kcal", value: totals.kcal, target: totals.kcalTarget, accent: { text: "text-teal", dot: "bg-teal" } },
    { label: "Proteine", unit: "g", value: totals.protein, target: totals.proteinTarget, accent: MACRO_ACCENT.protein },
    { label: "Carboidrati", unit: "g", value: totals.carbs, target: totals.carbsTarget, accent: MACRO_ACCENT.carbs },
    { label: "Grassi", unit: "g", value: totals.fat, target: totals.fatTarget, accent: MACRO_ACCENT.fat },
  ];

  const sourceEntries = Array.from(proteinSourceCounts.entries()).filter(([, count]) => count > 0);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 rounded-full" style={ringStyle}>
          <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-surface text-center">
            <span className="text-[15px] font-bold leading-none">{totals.kcal}</span>
            <span className="mt-0.5 text-[8.5px] leading-none text-ink-faint">kcal / sett.</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {bars.map((bar) => {
            const pct = bar.target > 0 ? Math.min(100, Math.round((bar.value / bar.target) * 100)) : null;
            const delta = bar.target > 0 ? bar.value - bar.target : null;
            return (
              <div key={bar.label}>
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className={`flex items-center gap-1.5 font-semibold ${bar.accent.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${bar.accent.dot}`} />
                    {bar.label}
                  </span>
                  <span className="text-ink-soft">
                    <span className="font-semibold">{bar.value}</span>
                    {bar.target > 0 ? ` / ${bar.target} ${bar.unit}` : ` ${bar.unit}`}
                    {delta !== null && (
                      <span className={`ml-1.5 ${delta > 0 ? "text-bad" : "text-good"}`}>
                        {delta > 0 ? `+${delta}` : delta} {bar.unit}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream">
                  <div
                    className={`h-full rounded-full ${bar.accent.dot}`}
                    style={{ width: `${pct === null ? Math.min(100, (bar.value > 0 ? 100 : 0)) : pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sourceEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line bg-cream px-4 py-2.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Fonti proteiche</span>
          {sourceEntries.map(([source, count]) => {
            const accent = PROTEIN_SOURCE_ACCENT[source];
            return (
              <span
                key={source}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${accent.bg} ${accent.border} ${accent.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                {proteinSourceLabel(source)} ×{count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MealCell({
  clientId,
  meal,
  foods,
  foodsById,
  supplements,
  recipes,
  recipesById,
}: {
  clientId: string;
  meal: Meal;
  foods: Food[];
  foodsById: Map<string, Food>;
  supplements: Supplement[];
  recipes: Recipe[];
  recipesById: Map<string, Recipe>;
}) {
  const isSupplementRow = meal.meal_type === "integratori";
  const supplementsById = useMemo(() => new Map(supplements.map((s) => [s.id, s])), [supplements]);

  const [adding, setAdding] = useState(false);
  const [itemKind, setItemKind] = useState<"alimento" | "ricetta">("alimento");
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedSupplementId, setSelectedSupplementId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(isSupplementRow ? "1" : "100");
  const [unit, setUnit] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [popupItemId, setPopupItemId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isRecipeMode = !isSupplementRow && itemKind === "ricetta";

  const foodMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [foods, query]);

  const supplementMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return supplements.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [supplements, query]);

  const recipeMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return recipes.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 8);
  }, [recipes, query]);

  function resetAddForm() {
    setAdding(false);
    setQuery("");
    setSelectedFoodId(null);
    setSelectedSupplementId(null);
    setSelectedRecipeId(null);
    setQuantity(isSupplementRow ? "1" : "100");
    setUnit("");
  }

  function submitAdd() {
    if (isSupplementRow) {
      if (!selectedSupplementId || !quantity.trim()) return;
      startTransition(async () => {
        await addMealItem(clientId, meal.id, {
          food_id: null,
          supplement_id: selectedSupplementId,
          unit: unit.trim() || null,
          custom_name: null,
          quantity_g: Number(quantity),
        });
        resetAddForm();
      });
      return;
    }
    if (isRecipeMode) {
      if (!selectedRecipeId || !quantity.trim()) return;
      startTransition(async () => {
        await addMealItem(clientId, meal.id, {
          food_id: null,
          recipe_id: selectedRecipeId,
          unit: "porzione",
          custom_name: null,
          quantity_g: Number(quantity),
        });
        resetAddForm();
      });
      return;
    }
    if (!selectedFoodId || !quantity.trim()) return;
    startTransition(async () => {
      await addMealItem(clientId, meal.id, {
        food_id: selectedFoodId,
        custom_name: null,
        quantity_g: Number(quantity),
      });
      resetAddForm();
    });
  }

  const popupItem = popupItemId ? meal.diet_plan_meal_items.find((i) => i.id === popupItemId) ?? null : null;

  return (
    <div className="rounded-md border border-line bg-cream p-1.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-ink-faint">
          {meal.diet_plan_meal_items.length} {isSupplementRow ? "integratori" : "elementi"}
        </span>
        <button
          type="button"
          onClick={() => startTransition(() => deleteMeal(clientId, meal.id))}
          aria-label="Elimina pasto"
          className="text-ink-faint hover:text-bad"
        >
          <Trash2 size={11} strokeWidth={2.2} />
        </button>
      </div>

      <div className="space-y-1">
        {meal.diet_plan_meal_items.map((item) => {
          const food = item.food_id ? foodsById.get(item.food_id) : null;
          const supplement = item.supplement_id ? supplementsById.get(item.supplement_id) : null;
          const recipe = item.recipe_id ? recipesById.get(item.recipe_id) : null;
          const scaled = food ? scaleFoodToQuantity(food, item.quantity_g) : null;
          const recipeScaled = recipe ? scaleRecipeToPortions(recipe, item.quantity_g) : null;
          const isExpanded = expandedId === item.id;
          const accent = food ? proteinSourceAccent(food.protein_source) : null;

          if (food) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPopupItemId(item.id)}
                className={`block w-full rounded px-1.5 py-1 text-left ${
                  accent ? `${accent.bg} border ${accent.border}` : "border border-transparent bg-surface"
                }`}
              >
                <span className={`block truncate text-[11px] font-medium ${accent ? accent.text : ""}`}>{food.name}</span>
                <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                  {item.quantity_g}
                  {item.unit || "g"}
                  {scaled && <span>· {Math.round(scaled.kcal)} kcal</span>}
                </span>
              </button>
            );
          }

          return (
            <div key={item.id} className="rounded bg-surface px-1.5 py-1">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  disabled={!recipe}
                  onClick={() => recipe && setExpandedId(isExpanded ? null : item.id)}
                  className={`min-w-0 flex-1 text-left ${recipe ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate text-[11px] font-medium">
                      {recipe?.name ?? supplement?.name ?? item.custom_name ?? (isSupplementRow ? "Integratore" : "Alimento")}
                    </span>
                    {recipe && <span className="shrink-0 text-[9px] text-ink-faint">{isExpanded ? "▲" : "▼"}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      defaultValue={item.quantity_g}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v > 0) startTransition(() => updateMealItemQuantity(clientId, item.id, v));
                      }}
                      className="w-12 rounded border border-line bg-cream px-1 py-0.5 text-[10.5px] outline-none focus:border-teal"
                    />
                    <span className="text-[10px] text-ink-faint">
                      {item.unit || (supplement || recipe ? "" : "g")}
                    </span>
                    {recipeScaled && <span className="text-[10px] text-ink-faint">· {Math.round(recipeScaled.kcal)} kcal</span>}
                    {supplement?.suggested_use && (
                      <span className="truncate text-[10px] text-ink-faint">· {supplement.suggested_use}</span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => startTransition(() => deleteMealItem(clientId, item.id))}
                  aria-label="Rimuovi"
                  className="shrink-0 text-ink-faint hover:text-bad"
                >
                  <Trash2 size={11} strokeWidth={2.2} />
                </button>
              </div>
              {recipe && isExpanded && (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] leading-relaxed text-ink-soft">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="mt-1.5 rounded border border-line bg-surface p-1.5">
          {!isSupplementRow && (
            <div className="mb-1.5 flex gap-1">
              {(["alimento", "ricetta"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setItemKind(k);
                    setQuery("");
                    setSelectedFoodId(null);
                    setSelectedRecipeId(null);
                  }}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    itemKind === k ? "border-teal bg-teal text-white" : "border-line bg-cream text-ink-soft"
                  }`}
                >
                  {k === "alimento" ? "Alimento" : "Ricetta"}
                </button>
              ))}
            </div>
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedFoodId(null);
              setSelectedSupplementId(null);
              setSelectedRecipeId(null);
            }}
            placeholder={isSupplementRow ? "Cerca integratore…" : isRecipeMode ? "Cerca ricetta…" : "Cerca alimento…"}
            className="mb-1 w-full rounded border border-line bg-cream px-1.5 py-1 text-[11px] outline-none focus:border-teal"
          />
          {isSupplementRow
            ? supplementMatches.length > 0 &&
              !selectedSupplementId && (
                <div className="mb-1 max-h-28 overflow-y-auto rounded border border-line bg-cream">
                  {supplementMatches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSupplementId(s.id);
                        setQuery(s.name);
                      }}
                      className="block w-full px-1.5 py-1 text-left text-[11px] hover:bg-teal-soft"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )
            : isRecipeMode
              ? recipeMatches.length > 0 &&
                !selectedRecipeId && (
                  <div className="mb-1 max-h-28 overflow-y-auto rounded border border-line bg-cream">
                    {recipeMatches.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRecipeId(r.id);
                          setQuery(r.name);
                        }}
                        className="block w-full px-1.5 py-1 text-left text-[11px] hover:bg-teal-soft"
                      >
                        {r.emoji ? `${r.emoji} ` : ""}
                        {r.name}
                      </button>
                    ))}
                  </div>
                )
              : foodMatches.length > 0 &&
                !selectedFoodId && (
                  <div className="mb-1 max-h-28 overflow-y-auto rounded border border-line bg-cream">
                    {foodMatches.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFoodId(f.id);
                          setQuery(f.name);
                        }}
                        className="block w-full px-1.5 py-1 text-left text-[11px] hover:bg-teal-soft"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step={isRecipeMode ? "0.5" : "1"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-12 rounded border border-line bg-cream px-1 py-0.5 text-[11px] outline-none focus:border-teal"
            />
            {isSupplementRow ? (
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cps, misurino…"
                className="w-20 rounded border border-line bg-cream px-1 py-0.5 text-[11px] outline-none focus:border-teal"
              />
            ) : (
              <span className="text-[10px] text-ink-faint">{isRecipeMode ? "porz." : "g"}</span>
            )}
            <button
              type="button"
              disabled={
                (isSupplementRow ? !selectedSupplementId : isRecipeMode ? !selectedRecipeId : !selectedFoodId) || pending
              }
              onClick={submitAdd}
              className="ml-auto rounded bg-teal px-2 py-0.5 text-[10.5px] font-medium text-white disabled:opacity-50"
            >
              Aggiungi
            </button>
            <button type="button" onClick={resetAddForm} className="text-[10.5px] text-ink-faint">
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded border border-dashed border-line py-1 text-[10.5px] text-ink-faint hover:border-teal hover:text-teal"
        >
          <Plus size={10} strokeWidth={2.2} />
          {isSupplementRow ? "Integratore" : "Alimento o ricetta"}
        </button>
      )}

      {popupItem && (
        <FoodItemPopup
          clientId={clientId}
          mealId={meal.id}
          item={popupItem}
          foods={foods}
          foodsById={foodsById}
          onClose={() => setPopupItemId(null)}
        />
      )}
    </div>
  );
}

/** Popup al click su un alimento: riepilogo kcal/macro, quantità, sostituzione, duplicazione e alternative. */
function FoodItemPopup({
  clientId,
  mealId,
  item,
  foods,
  foodsById,
  onClose,
}: {
  clientId: string;
  mealId: string;
  item: MealItem;
  foods: Food[];
  foodsById: Map<string, Food>;
  onClose: () => void;
}) {
  const food = item.food_id ? foodsById.get(item.food_id) : null;
  const [pending, startTransition] = useTransition();
  const [panel, setPanel] = useState<"none" | "replace" | "alternatives">("none");
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !food) return [];
    return foods.filter((f) => f.name.toLowerCase().includes(q) && f.id !== food.id).slice(0, 8);
  }, [foods, query, food]);

  if (!food) return null;

  const scaled = scaleFoodToQuantity(food, item.quantity_g);
  const accent = proteinSourceAccent(food.protein_source);
  const isPieces = item.unit === "pz";

  const alternatives = (item.alternative_food_ids ?? [])
    .map((id) => foodsById.get(id))
    .filter((f): f is Food => Boolean(f));

  function addAlternative(foodId: string) {
    const next = Array.from(new Set([...(item.alternative_food_ids ?? []), foodId]));
    startTransition(() => setMealItemAlternatives(clientId, item.id, next));
    setQuery("");
    setPanel("none");
  }

  function removeAlternative(foodId: string) {
    const next = (item.alternative_food_ids ?? []).filter((id) => id !== foodId);
    startTransition(() => setMealItemAlternatives(clientId, item.id, next));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-xl border border-line bg-surface p-3.5 shadow-xl"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className={`text-[13px] font-semibold ${accent ? accent.text : ""}`}>{food.name}</span>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="shrink-0 text-ink-faint hover:text-ink">
            <X size={15} strokeWidth={2.2} />
          </button>
        </div>

        {accent && (
          <span className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${accent.bg} ${accent.border} ${accent.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
            {proteinSourceLabel(food.protein_source)}
          </span>
        )}

        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-line bg-cream px-2 py-0.5 text-[10.5px] font-semibold">
            {Math.round(scaled.kcal)} KCAL
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${MACRO_ACCENT.protein.bg} ${MACRO_ACCENT.protein.border} ${MACRO_ACCENT.protein.text}`}>
            P {Math.round(scaled.protein)}G
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${MACRO_ACCENT.carbs.bg} ${MACRO_ACCENT.carbs.border} ${MACRO_ACCENT.carbs.text}`}>
            C {Math.round(scaled.carbs)}G
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${MACRO_ACCENT.fat.bg} ${MACRO_ACCENT.fat.border} ${MACRO_ACCENT.fat.text}`}>
            G {Math.round(scaled.fat)}G
          </span>
        </div>

        <div className="mb-2.5 flex items-center gap-1.5">
          <input
            type="number"
            defaultValue={item.quantity_g}
            onBlur={(e) => {
              const v = Number(e.target.value);
              if (v > 0) startTransition(() => updateMealItemQuantity(clientId, item.id, v));
            }}
            className="w-16 rounded border border-line bg-cream px-1.5 py-1 text-[12px] outline-none focus:border-teal"
          />
          <div className="flex overflow-hidden rounded border border-line">
            <button
              type="button"
              onClick={() => startTransition(() => updateMealItemUnit(clientId, item.id, null))}
              className={`px-2 py-1 text-[10.5px] font-medium ${!isPieces ? "bg-teal text-white" : "bg-cream text-ink-soft"}`}
            >
              g
            </button>
            <button
              type="button"
              onClick={() => startTransition(() => updateMealItemUnit(clientId, item.id, "pz"))}
              className={`px-2 py-1 text-[10.5px] font-medium ${isPieces ? "bg-teal text-white" : "bg-cream text-ink-soft"}`}
            >
              pz
            </button>
          </div>
          <button
            type="button"
            onClick={() => startTransition(async () => { await deleteMealItem(clientId, item.id); onClose(); })}
            aria-label="Elimina alimento"
            className="ml-auto text-ink-faint hover:text-bad"
          >
            <Trash2 size={14} strokeWidth={2.2} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPanel(panel === "replace" ? "none" : "replace")}
          className="mb-1.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-line bg-cream py-1.5 text-[11.5px] font-medium text-ink-soft hover:border-teal hover:text-teal"
        >
          <Repeat size={12} strokeWidth={2.2} />
          Sostituisci con un altro alimento
        </button>

        {panel === "replace" && (
          <div className="mb-1.5 rounded border border-line bg-cream p-1.5">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca alimento…"
              className="mb-1 w-full rounded border border-line bg-surface px-1.5 py-1 text-[11px] outline-none focus:border-teal"
            />
            {matches.length > 0 && (
              <div className="max-h-28 overflow-y-auto rounded border border-line bg-surface">
                {matches.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        await replaceMealItemFood(clientId, item.id, f.id);
                        setPanel("none");
                        setQuery("");
                      });
                    }}
                    className="block w-full px-1.5 py-1 text-left text-[11px] hover:bg-teal-soft"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await duplicateMealItem(clientId, mealId, item);
              onClose();
            })
          }
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-line bg-cream py-1.5 text-[11.5px] font-medium text-ink-soft hover:border-teal hover:text-teal disabled:opacity-50"
        >
          <Files size={12} strokeWidth={2.2} />
          Duplica alimento
        </button>

        <div className="border-t border-line pt-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">Alternative</span>
            <button
              type="button"
              onClick={() => setPanel(panel === "alternatives" ? "none" : "alternatives")}
              className="flex items-center gap-0.5 text-[11px] font-medium text-teal"
            >
              <Plus size={11} strokeWidth={2.2} />
              Aggiungi
            </button>
          </div>

          {alternatives.length === 0 ? (
            <p className="text-[11px] text-ink-faint">Nessuna alternativa per questo alimento.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {alternatives.map((alt) => {
                const altAccent = proteinSourceAccent(alt.protein_source);
                return (
                  <span
                    key={alt.id}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${
                      altAccent ? `${altAccent.bg} ${altAccent.border} ${altAccent.text}` : "border-line bg-cream text-ink-soft"
                    }`}
                  >
                    {alt.name}
                    <button type="button" onClick={() => removeAlternative(alt.id)} aria-label="Rimuovi alternativa">
                      <X size={10} strokeWidth={2.4} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {panel === "alternatives" && (
            <div className="mt-1.5 rounded border border-line bg-cream p-1.5">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca alimento da aggiungere…"
                className="mb-1 w-full rounded border border-line bg-surface px-1.5 py-1 text-[11px] outline-none focus:border-teal"
              />
              {matches.length > 0 && (
                <div className="max-h-28 overflow-y-auto rounded border border-line bg-surface">
                  {matches
                    .filter((f) => !(item.alternative_food_ids ?? []).includes(f.id))
                    .map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => addAlternative(f.id)}
                        className="block w-full px-1.5 py-1 text-left text-[11px] hover:bg-teal-soft"
                      >
                        {f.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
