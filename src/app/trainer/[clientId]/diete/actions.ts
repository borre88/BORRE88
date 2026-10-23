"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

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

/** Sostituisce l'intera lista di alimenti alternativi per una riga. */
export async function setMealItemAlternatives(clientId: string, itemId: string, alternativeFoodIds: string[]) {
  const supabase = await createClient();
  await supabase.from("diet_plan_meal_items").update({ alternative_food_ids: alternativeFoodIds }).eq("id", itemId);
  revalidate(clientId);
}
