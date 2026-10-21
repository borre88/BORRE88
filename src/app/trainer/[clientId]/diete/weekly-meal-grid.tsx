"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS_SHORT,
  MACRO_ACCENT,
  scaleFoodToQuantity,
  mealTypeDotClass,
  todayWeekdayMon0,
} from "@/lib/diet-calc";
import {
  addMeal,
  deleteMeal,
  addMealItem,
  updateMealItemQuantity,
  deleteMealItem,
  copyDayToWeekdays,
} from "./actions";

type Food = Tables<"foods">;
type Supplement = Tables<"supplements">;
type MealItem = Tables<"diet_plan_meal_items">;
type Meal = Tables<"diet_plan_meals"> & { diet_plan_meal_items: MealItem[] };

export function WeeklyMealGrid({
  clientId,
  planId,
  meals,
  foods,
  supplements = [],
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
        const food = item.food_id ? foodsById.get(item.food_id) : null;
        if (!food) continue;
        const scaled = scaleFoodToQuantity(food, item.quantity_g);
        kcal += scaled.kcal;
        protein += scaled.protein;
        carbs += scaled.carbs;
        fat += scaled.fat;
      }
    }
    return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
  }

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
                        <MealCell clientId={clientId} meal={meal} foods={foods} foodsById={foodsById} supplements={supplements} />
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

function MealCell({
  clientId,
  meal,
  foods,
  foodsById,
  supplements,
}: {
  clientId: string;
  meal: Meal;
  foods: Food[];
  foodsById: Map<string, Food>;
  supplements: Supplement[];
}) {
  const isSupplementRow = meal.meal_type === "integratori";
  const supplementsById = useMemo(() => new Map(supplements.map((s) => [s.id, s])), [supplements]);

  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [selectedSupplementId, setSelectedSupplementId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(isSupplementRow ? "1" : "100");
  const [unit, setUnit] = useState("");
  const [pending, startTransition] = useTransition();

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
        setAdding(false);
        setQuery("");
        setSelectedSupplementId(null);
        setQuantity("1");
        setUnit("");
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
      setAdding(false);
      setQuery("");
      setSelectedFoodId(null);
      setQuantity("100");
    });
  }

  return (
    <div className="rounded-md border border-line bg-cream p-1.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-ink-faint">
          {meal.diet_plan_meal_items.length} {isSupplementRow ? "integratori" : "alimenti"}
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
          const scaled = food ? scaleFoodToQuantity(food, item.quantity_g) : null;
          return (
            <div key={item.id} className="flex items-center justify-between gap-1 rounded bg-surface px-1.5 py-1">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium">
                  {food?.name ?? supplement?.name ?? item.custom_name ?? (isSupplementRow ? "Integratore" : "Alimento")}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={item.quantity_g}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (v > 0) startTransition(() => updateMealItemQuantity(clientId, item.id, v));
                    }}
                    className="w-12 rounded border border-line bg-cream px-1 py-0.5 text-[10.5px] outline-none focus:border-teal"
                  />
                  <span className="text-[10px] text-ink-faint">{item.unit || (supplement ? "" : "g")}</span>
                  {scaled && <span className="text-[10px] text-ink-faint">· {Math.round(scaled.kcal)} kcal</span>}
                  {supplement?.suggested_use && (
                    <span className="truncate text-[10px] text-ink-faint">· {supplement.suggested_use}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => startTransition(() => deleteMealItem(clientId, item.id))}
                aria-label="Rimuovi"
                className="shrink-0 text-ink-faint hover:text-bad"
              >
                <Trash2 size={11} strokeWidth={2.2} />
              </button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="mt-1.5 rounded border border-line bg-surface p-1.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedFoodId(null);
              setSelectedSupplementId(null);
            }}
            placeholder={isSupplementRow ? "Cerca integratore…" : "Cerca alimento…"}
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
              <span className="text-[10px] text-ink-faint">g</span>
            )}
            <button
              type="button"
              disabled={(isSupplementRow ? !selectedSupplementId : !selectedFoodId) || pending}
              onClick={submitAdd}
              className="ml-auto rounded bg-teal px-2 py-0.5 text-[10.5px] font-medium text-white disabled:opacity-50"
            >
              Aggiungi
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setQuery("");
                setSelectedFoodId(null);
                setSelectedSupplementId(null);
              }}
              className="text-[10.5px] text-ink-faint"
            >
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
          {isSupplementRow ? "Integratore" : "Alimento"}
        </button>
      )}
    </div>
  );
}
