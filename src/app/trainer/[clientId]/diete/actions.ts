"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";
import { computeEquivalentQuantity, type EquivalenceType } from "@/lib/diet-calc";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export interface PlanInput {
  name: string;
  phase: string | null;
  notes: string | null;
  start_date: string;
  duration_weeks: number;
  macro_only: boolean;
  bmr: number | null;
  tdee: number | null;
  pal: number | null;
  target_kcal: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
}

function revalidate(clientId: string) {
  revalidatePath(`/trainer/${clientId}/diete`);
  revalidatePath("/cliente/diete");
}

export async function createPlan(clientId: string, input: PlanInput): Promise<ActionState & { planId?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Il nome del piano è obbligatorio." };

  const supabase = await createClient();
  const { data: plan, error } = await supabase
    .from("diet_plans")
    .insert({
      client_id: clientId,
      name,
      phase: input.phase,
      notes: input.notes?.trim() || null,
      start_date: input.start_date,
      duration_weeks: input.duration_weeks,
      macro_only: input.macro_only,
      bmr: input.bmr,
      tdee: input.tdee,
      pal: input.pal,
      target_kcal: input.target_kcal,
      target_protein_g: input.target_protein_g,
      target_carbs_g: input.target_carbs_g,
      target_fat_g: input.target_fat_g,
    })
    .select("id")
    .single();

  if (error || !plan) return { error: "Impossibile creare il piano." };

  if (!input.macro_only) {
    const defaultMeals = ["colazione", "pranzo", "cena"] as const;
    const rows: { plan_id: string; weekday: number; meal_type: string; position: number }[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      defaultMeals.forEach((mealType, i) => {
        rows.push({ plan_id: plan.id, weekday, meal_type: mealType, position: i });
      });
    }
    await supabase.from("diet_plan_meals").insert(rows);
  }

  revalidate(clientId);
  return { success: true, planId: plan.id };
}

export async function updatePlan(clientId: string, planId: string, input: PlanInput): Promise<ActionState> {
  const name = input.name.trim();
  if (!name) return { error: "Il nome del piano è obbligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("diet_plans")
    .update({
      name,
      phase: input.phase,
      notes: input.notes?.trim() || null,
      start_date: input.start_date,
      duration_weeks: input.duration_weeks,
      macro_only: input.macro_only,
      bmr: input.bmr,
      tdee: input.tdee,
      pal: input.pal,
      target_kcal: input.target_kcal,
      target_protein_g: input.target_protein_g,
      target_carbs_g: input.target_carbs_g,
      target_fat_g: input.target_fat_g,
    })
    .eq("id", planId);

  if (error) return { error: "Impossibile aggiornare il piano." };

  revalidate(clientId);
  return { success: true };
}

export async function setPlanActive(clientId: string, planId: string, active: boolean) {
  const supabase = await createClient();
  if (active) {
    // Un solo piano attivo alla volta per cliente.
    await supabase.from("diet_plans").update({ active: false }).eq("client_id", clientId);
  }
  await supabase.from("diet_plans").update({ active }).eq("id", planId);
  revalidate(clientId);
}

export async function deletePlan(clientId: string, planId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plans").delete().eq("id", planId);
  revalidate(clientId);
}

export async function upsertPlanDay(
  clientId: string,
  planId: string,
  weekday: number,
  data: {
    label: string | null;
    target_kcal: number | null;
    target_protein_g: number | null;
    target_carbs_g: number | null;
    target_fat_g: number | null;
  }
) {
  const supabase = await createClient();
  await supabase
    .from("diet_plan_days")
    .upsert(
      { plan_id: planId, weekday, ...data },
      { onConflict: "plan_id,weekday" }
    );
  revalidate(clientId);
}

export async function clearPlanDayOverride(clientId: string, planId: string, weekday: number) {
  const supabase = await createClient();
  await supabase.from("diet_plan_days").delete().eq("plan_id", planId).eq("weekday", weekday);
  revalidate(clientId);
}

export interface DayPresetRow {
  weekday: number;
  label: string | null;
  target_kcal: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
}

/** Applica in blocco una scorciatoia (es. "Allenamento/Riposo") a più giorni in una sola chiamata. */
export async function applyDayPreset(clientId: string, planId: string, rows: DayPresetRow[]) {
  if (rows.length === 0) return;
  const supabase = await createClient();
  await supabase
    .from("diet_plan_days")
    .upsert(
      rows.map((r) => ({ plan_id: planId, ...r })),
      { onConflict: "plan_id,weekday" }
    );
  revalidate(clientId);
}

/** Azzera tutti i target giorno-per-giorno del piano (torna al target unico), lasciando intatti i giorni bloccati. */
export async function clearAllPlanDayOverrides(clientId: string, planId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_days").delete().eq("plan_id", planId).eq("locked", false);
  revalidate(clientId);
}

export async function toggleDayLock(clientId: string, planId: string, weekday: number, locked: boolean) {
  const supabase = await createClient();
  await supabase
    .from("diet_plan_days")
    .upsert({ plan_id: planId, weekday, locked }, { onConflict: "plan_id,weekday" });
  revalidate(clientId);
}

/** Rinomina un'etichetta su tutti i giorni del piano che la usano. */
export async function renameDayLabel(clientId: string, planId: string, oldLabel: string, newLabel: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_days").update({ label: newLabel }).eq("plan_id", planId).eq("label", oldLabel);
  revalidate(clientId);
}

/** Copia il target (etichetta + macro) di un giorno su un altro giorno della settimana. */
export async function copyDayTargetsTo(clientId: string, planId: string, fromWeekday: number, toWeekday: number) {
  const supabase = await createClient();
  const { data: source } = await supabase
    .from("diet_plan_days")
    .select("label, target_kcal, target_protein_g, target_carbs_g, target_fat_g")
    .eq("plan_id", planId)
    .eq("weekday", fromWeekday)
    .maybeSingle();
  if (!source) return;
  const { data: target } = await supabase
    .from("diet_plan_days")
    .select("locked")
    .eq("plan_id", planId)
    .eq("weekday", toWeekday)
    .maybeSingle();
  if (target?.locked) return;
  await supabase
    .from("diet_plan_days")
    .upsert({ plan_id: planId, weekday: toWeekday, ...source }, { onConflict: "plan_id,weekday" });
  revalidate(clientId);
}

export async function addMeal(clientId: string, planId: string, weekday: number, mealType: string, name: string | null) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("diet_plan_meals")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", planId)
    .eq("weekday", weekday);
  await supabase.from("diet_plan_meals").insert({
    plan_id: planId,
    weekday,
    meal_type: mealType,
    name,
    position: count ?? 0,
  });
  revalidate(clientId);
}

export async function deleteMeal(clientId: string, mealId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meals").delete().eq("id", mealId);
  revalidate(clientId);
}

/** Copia tutti i pasti (con alimenti) di un giorno su altri giorni della settimana, sostituendo quelli esistenti. */
export async function copyDayToWeekdays(clientId: string, planId: string, fromWeekday: number, toWeekdays: number[]) {
  const supabase = await createClient();

  const { data: sourceMeals } = await supabase
    .from("diet_plan_meals")
    .select("*, diet_plan_meal_items(*)")
    .eq("plan_id", planId)
    .eq("weekday", fromWeekday);

  if (!sourceMeals || sourceMeals.length === 0) return;

  for (const weekday of toWeekdays) {
    if (weekday === fromWeekday) continue;
    await supabase.from("diet_plan_meals").delete().eq("plan_id", planId).eq("weekday", weekday);

    for (const meal of sourceMeals) {
      const { data: newMeal } = await supabase
        .from("diet_plan_meals")
        .insert({
          plan_id: planId,
          weekday,
          meal_type: meal.meal_type,
          name: meal.name,
          position: meal.position,
          notes: meal.notes,
        })
        .select("id")
        .single();

      if (newMeal && meal.diet_plan_meal_items.length > 0) {
        await supabase.from("diet_plan_meal_items").insert(
          meal.diet_plan_meal_items.map((item) => ({
            meal_id: newMeal.id,
            food_id: item.food_id,
            recipe_id: item.recipe_id,
            supplement_id: item.supplement_id,
            unit: item.unit,
            custom_name: item.custom_name,
            quantity_g: item.quantity_g,
            position: item.position,
          }))
        );
      }
    }
  }

  revalidate(clientId);
}

export async function addMealItem(
  clientId: string,
  mealId: string,
  data: {
    food_id: string | null;
    recipe_id?: string | null;
    supplement_id?: string | null;
    unit?: string | null;
    custom_name: string | null;
    quantity_g: number;
  }
) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("diet_plan_meal_items")
    .select("id", { count: "exact", head: true })
    .eq("meal_id", mealId);
  await supabase.from("diet_plan_meal_items").insert({
    meal_id: mealId,
    food_id: data.food_id,
    recipe_id: data.recipe_id ?? null,
    supplement_id: data.supplement_id ?? null,
    unit: data.unit ?? null,
    custom_name: data.custom_name,
    quantity_g: data.quantity_g,
    position: count ?? 0,
  });
  revalidate(clientId);
}

export async function updateMealItemQuantity(clientId: string, itemId: string, quantityG: number) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_items").update({ quantity_g: quantityG }).eq("id", itemId);
  revalidate(clientId);
}

export async function updateMealItemUnit(clientId: string, itemId: string, unit: string | null) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_items").update({ unit }).eq("id", itemId);
  revalidate(clientId);
}

export async function deleteMealItem(clientId: string, itemId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_items").delete().eq("id", itemId);
  revalidate(clientId);
}

/** Sostituisce l'alimento di una riga esistente, mantenendo quantità e posizione. */
export async function replaceMealItemFood(clientId: string, itemId: string, foodId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_items").update({ food_id: foodId, custom_name: null }).eq("id", itemId);
  revalidate(clientId);
}

/** Duplica una riga alimento/ricetta/integratore nello stesso pasto. */
export async function duplicateMealItem(clientId: string, mealId: string, item: Tables<"diet_plan_meal_items">) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("diet_plan_meal_items")
    .select("id", { count: "exact", head: true })
    .eq("meal_id", mealId);
  await supabase.from("diet_plan_meal_items").insert({
    meal_id: mealId,
    food_id: item.food_id,
    recipe_id: item.recipe_id,
    supplement_id: item.supplement_id,
    unit: item.unit,
    custom_name: item.custom_name,
    quantity_g: item.quantity_g,
    position: count ?? 0,
  });
  revalidate(clientId);
}

/** Aggiunge un'alternativa calcolando subito la quantità equivalente (kcal/proteine/carboidrati/grassi) all'alimento originale. */
export async function addMealItemAlternative(
  clientId: string,
  itemId: string,
  foodId: string,
  equivalenceType: EquivalenceType
) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("diet_plan_meal_items")
    .select("food_id, quantity_g")
    .eq("id", itemId)
    .single();
  if (!item?.food_id) return;

  const { data: foods } = await supabase.from("foods").select("*").in("id", [item.food_id, foodId]);
  const originalFood = foods?.find((f) => f.id === item.food_id);
  const altFood = foods?.find((f) => f.id === foodId);
  if (!originalFood || !altFood) return;

  const quantity = computeEquivalentQuantity(originalFood, item.quantity_g, altFood, equivalenceType);
  if (quantity === null) return;

  const { count } = await supabase
    .from("diet_plan_meal_item_alternatives")
    .select("id", { count: "exact", head: true })
    .eq("meal_item_id", itemId);

  await supabase.from("diet_plan_meal_item_alternatives").insert({
    meal_item_id: itemId,
    food_id: foodId,
    quantity_g: Math.round(quantity),
    equivalence_type: equivalenceType,
    position: count ?? 0,
  });
  revalidate(clientId);
}

export async function updateMealItemAlternativeQuantity(clientId: string, altId: string, quantityG: number) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_item_alternatives").update({ quantity_g: quantityG }).eq("id", altId);
  revalidate(clientId);
}

/** Cambia il tipo di equivalenza di un'alternativa e ne ricalcola la quantità. */
export async function updateMealItemAlternativeEquivalence(
  clientId: string,
  altId: string,
  itemId: string,
  equivalenceType: EquivalenceType
) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("diet_plan_meal_items")
    .select("food_id, quantity_g")
    .eq("id", itemId)
    .single();
  const { data: alt } = await supabase
    .from("diet_plan_meal_item_alternatives")
    .select("food_id")
    .eq("id", altId)
    .single();

  if (!item?.food_id || !alt) {
    await supabase.from("diet_plan_meal_item_alternatives").update({ equivalence_type: equivalenceType }).eq("id", altId);
    revalidate(clientId);
    return;
  }

  const { data: foods } = await supabase.from("foods").select("*").in("id", [item.food_id, alt.food_id]);
  const originalFood = foods?.find((f) => f.id === item.food_id);
  const altFood = foods?.find((f) => f.id === alt.food_id);
  const quantity =
    originalFood && altFood ? computeEquivalentQuantity(originalFood, item.quantity_g, altFood, equivalenceType) : null;

  await supabase
    .from("diet_plan_meal_item_alternatives")
    .update({
      equivalence_type: equivalenceType,
      ...(quantity !== null ? { quantity_g: Math.round(quantity) } : {}),
    })
    .eq("id", altId);
  revalidate(clientId);
}

export async function removeMealItemAlternative(clientId: string, altId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_item_alternatives").delete().eq("id", altId);
  revalidate(clientId);
}

/** Ricalcola le quantità di tutte le alternative in base al tipo di equivalenza di ciascuna e alla quantità attuale dell'originale. */
export async function rebalanceMealItemAlternatives(clientId: string, itemId: string) {
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("diet_plan_meal_items")
    .select("food_id, quantity_g")
    .eq("id", itemId)
    .single();
  if (!item?.food_id) return;

  const { data: alternatives } = await supabase
    .from("diet_plan_meal_item_alternatives")
    .select("id, food_id, equivalence_type")
    .eq("meal_item_id", itemId);
  if (!alternatives || alternatives.length === 0) return;

  const foodIds = Array.from(new Set([item.food_id, ...alternatives.map((a) => a.food_id)]));
  const { data: foods } = await supabase.from("foods").select("*").in("id", foodIds);
  const foodsById = new Map((foods ?? []).map((f) => [f.id, f]));
  const originalFood = foodsById.get(item.food_id);
  if (!originalFood) return;

  for (const alt of alternatives) {
    const altFood = foodsById.get(alt.food_id);
    if (!altFood) continue;
    const quantity = computeEquivalentQuantity(
      originalFood,
      item.quantity_g,
      altFood,
      alt.equivalence_type as EquivalenceType
    );
    if (quantity === null) continue;
    await supabase.from("diet_plan_meal_item_alternatives").update({ quantity_g: Math.round(quantity) }).eq("id", alt.id);
  }
  revalidate(clientId);
}

/** Arrotonda tutte le quantità delle alternative al multiplo più vicino di `step` grammi. */
export async function roundMealItemAlternatives(clientId: string, itemId: string, step: number) {
  const supabase = await createClient();
  const { data: alternatives } = await supabase
    .from("diet_plan_meal_item_alternatives")
    .select("id, quantity_g")
    .eq("meal_item_id", itemId);

  for (const alt of alternatives ?? []) {
    const rounded = Math.round(alt.quantity_g / step) * step;
    if (rounded !== alt.quantity_g) {
      await supabase.from("diet_plan_meal_item_alternatives").update({ quantity_g: rounded }).eq("id", alt.id);
    }
  }
  revalidate(clientId);
}

export async function swapMealItemAlternativePosition(
  clientId: string,
  itemId: string,
  altId: string,
  direction: "up" | "down"
) {
  const supabase = await createClient();
  const { data: alternatives } = await supabase
    .from("diet_plan_meal_item_alternatives")
    .select("id, position")
    .eq("meal_item_id", itemId)
    .order("position", { ascending: true });
  if (!alternatives) return;

  const idx = alternatives.findIndex((a) => a.id === altId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= alternatives.length) return;

  const a = alternatives[idx];
  const b = alternatives[swapIdx];
  await supabase.from("diet_plan_meal_item_alternatives").update({ position: b.position }).eq("id", a.id);
  await supabase.from("diet_plan_meal_item_alternatives").update({ position: a.position }).eq("id", b.id);
  revalidate(clientId);
}

export async function updatePlanNotesAndHydration(
  clientId: string,
  planId: string,
  data: { notes: string | null; hydration_ml: number | null }
) {
  const supabase = await createClient();
  await supabase.from("diet_plans").update(data).eq("id", planId);
  revalidate(clientId);
}

export async function addRecommendedSupplement(clientId: string, planId: string, supplementId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("diet_plan_recommended_supplements")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", planId);
  await supabase.from("diet_plan_recommended_supplements").insert({
    plan_id: planId,
    supplement_id: supplementId,
    position: count ?? 0,
  });
  revalidate(clientId);
}

export async function removeRecommendedSupplement(clientId: string, id: string) {
  const supabase = await createClient();
  await supabase.from("diet_plan_recommended_supplements").delete().eq("id", id);
  revalidate(clientId);
}

export async function updateRecommendedSupplementNote(clientId: string, id: string, note: string | null) {
  const supabase = await createClient();
  await supabase.from("diet_plan_recommended_supplements").update({ note }).eq("id", id);
  revalidate(clientId);
}
