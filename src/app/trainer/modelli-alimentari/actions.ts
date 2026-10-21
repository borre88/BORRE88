"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export interface TemplateInput {
  name: string;
  phase: string | null;
  notes: string | null;
  duration_weeks: number;
  macro_only: boolean;
  target_kcal: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
}

function revalidate(templateId?: string) {
  revalidatePath("/trainer/modelli-alimentari");
  if (templateId) revalidatePath(`/trainer/modelli-alimentari/${templateId}`);
}

export async function createTemplate(input: TemplateInput): Promise<ActionState & { templateId?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Il nome del modello è obbligatorio." };

  const session = await getSession();
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from("diet_plans")
    .insert({
      client_id: null,
      is_template: true,
      trainer_id: session!.user.id,
      name,
      phase: input.phase,
      notes: input.notes?.trim() || null,
      duration_weeks: input.duration_weeks,
      macro_only: input.macro_only,
      target_kcal: input.target_kcal,
      target_protein_g: input.target_protein_g,
      target_carbs_g: input.target_carbs_g,
      target_fat_g: input.target_fat_g,
    })
    .select("id")
    .single();

  if (error || !template) return { error: "Impossibile creare il modello." };

  if (!input.macro_only) {
    const defaultMeals = ["colazione", "pranzo", "cena"] as const;
    const rows: { plan_id: string; weekday: number; meal_type: string; position: number }[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      defaultMeals.forEach((mealType, i) => {
        rows.push({ plan_id: template.id, weekday, meal_type: mealType, position: i });
      });
    }
    await supabase.from("diet_plan_meals").insert(rows);
  }

  revalidate(template.id);
  return { success: true, templateId: template.id };
}

export async function updateTemplate(templateId: string, input: TemplateInput): Promise<ActionState> {
  const name = input.name.trim();
  if (!name) return { error: "Il nome del modello è obbligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("diet_plans")
    .update({
      name,
      phase: input.phase,
      notes: input.notes?.trim() || null,
      duration_weeks: input.duration_weeks,
      macro_only: input.macro_only,
      target_kcal: input.target_kcal,
      target_protein_g: input.target_protein_g,
      target_carbs_g: input.target_carbs_g,
      target_fat_g: input.target_fat_g,
    })
    .eq("id", templateId);

  if (error) return { error: "Impossibile aggiornare il modello." };

  revalidate(templateId);
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  await supabase.from("diet_plans").delete().eq("id", templateId);
  revalidate();
}

/** Copia un modello (giorni, pasti e alimenti) in un nuovo piano assegnato a un cliente. */
export async function assignTemplateToClient(
  templateId: string,
  clientId: string,
  input: { startDate: string; setActive: boolean }
): Promise<ActionState & { planId?: string }> {
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("diet_plans")
    .select("*, diet_plan_days(*), diet_plan_meals(*, diet_plan_meal_items(*))")
    .eq("id", templateId)
    .eq("is_template", true)
    .single();

  if (!template) return { error: "Modello non trovato." };

  if (input.setActive) {
    await supabase.from("diet_plans").update({ active: false }).eq("client_id", clientId);
  }

  const { data: newPlan, error } = await supabase
    .from("diet_plans")
    .insert({
      client_id: clientId,
      is_template: false,
      active: input.setActive,
      name: template.name,
      phase: template.phase,
      notes: template.notes,
      start_date: input.startDate,
      duration_weeks: template.duration_weeks,
      macro_only: template.macro_only,
      target_kcal: template.target_kcal,
      target_protein_g: template.target_protein_g,
      target_carbs_g: template.target_carbs_g,
      target_fat_g: template.target_fat_g,
    })
    .select("id")
    .single();

  if (error || !newPlan) return { error: "Impossibile assegnare il modello al cliente." };

  for (const day of template.diet_plan_days) {
    await supabase.from("diet_plan_days").insert({
      plan_id: newPlan.id,
      weekday: day.weekday,
      label: day.label,
      target_kcal: day.target_kcal,
      target_protein_g: day.target_protein_g,
      target_carbs_g: day.target_carbs_g,
      target_fat_g: day.target_fat_g,
    });
  }

  for (const meal of template.diet_plan_meals) {
    const { data: newMeal } = await supabase
      .from("diet_plan_meals")
      .insert({
        plan_id: newPlan.id,
        weekday: meal.weekday,
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
          custom_name: item.custom_name,
          quantity_g: item.quantity_g,
          position: item.position,
        }))
      );
    }
  }

  revalidatePath(`/trainer/${clientId}/diete`);
  revalidatePath("/cliente/diete");
  return { success: true, planId: newPlan.id };
}
