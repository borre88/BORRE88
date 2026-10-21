"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FoodInput {
  name: string;
  category: string;
  kcal_100g: number;
  protein_100g: number;
  carbs_100g: number;
  fat_100g: number;
  fiber_100g: number;
}

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function createFood(data: FoodInput): Promise<ActionState> {
  const name = data.name.trim();
  if (!name) return { error: "Il nome dell'alimento è obbligatorio." };
  if (!Number.isFinite(data.kcal_100g) || data.kcal_100g < 0) {
    return { error: "Le kcal per 100g non sono valide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("foods").insert({
    name,
    category: data.category,
    kcal_100g: data.kcal_100g,
    protein_100g: data.protein_100g || 0,
    carbs_100g: data.carbs_100g || 0,
    fat_100g: data.fat_100g || 0,
    fiber_100g: data.fiber_100g || 0,
  });

  if (error) return { error: "Impossibile salvare l'alimento." };

  revalidatePath("/trainer/alimenti");
  return { success: true };
}

export async function updateFood(id: string, data: FoodInput): Promise<ActionState> {
  const name = data.name.trim();
  if (!name) return { error: "Il nome dell'alimento è obbligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("foods")
    .update({
      name,
      category: data.category,
      kcal_100g: data.kcal_100g,
      protein_100g: data.protein_100g || 0,
      carbs_100g: data.carbs_100g || 0,
      fat_100g: data.fat_100g || 0,
      fiber_100g: data.fiber_100g || 0,
    })
    .eq("id", id);

  if (error) return { error: "Impossibile aggiornare l'alimento." };

  revalidatePath("/trainer/alimenti");
  return { success: true };
}

export async function deleteFood(id: string) {
  const supabase = await createClient();
  await supabase.from("foods").delete().eq("id", id);
  revalidatePath("/trainer/alimenti");
}

/** Import in blocco da CSV (righe già parsate lato client). */
export async function bulkImportFoods(rows: FoodInput[]): Promise<ActionState & { imported?: number }> {
  const valid = rows
    .map((r) => ({ ...r, name: r.name.trim() }))
    .filter((r) => r.name && Number.isFinite(r.kcal_100g));

  if (valid.length === 0) return { error: "Nessuna riga valida trovata nel file." };

  const supabase = await createClient();
  const { error } = await supabase.from("foods").insert(
    valid.map((r) => ({
      name: r.name,
      category: r.category || "altro",
      kcal_100g: r.kcal_100g,
      protein_100g: r.protein_100g || 0,
      carbs_100g: r.carbs_100g || 0,
      fat_100g: r.fat_100g || 0,
      fiber_100g: r.fiber_100g || 0,
      source: "csv",
    }))
  );

  if (error) return { error: "Impossibile importare il file." };

  revalidatePath("/trainer/alimenti");
  return { success: true, imported: valid.length };
}
