"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidate() {
  revalidatePath("/trainer/ricette");
  revalidatePath("/cliente/nutrizione/ricette");
}

export interface RecipeInput {
  name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal: string;
  meal: string;
  tags: string[];
  time_minutes: number;
  emoji: string | null;
  ingredients: string[];
  steps: string[];
}

export async function createRecipe(input: RecipeInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").insert(input).select("id").single();

  if (error) return { error: "Impossibile creare la ricetta." };

  revalidate();
  return { recipeId: data.id };
}

export async function updateRecipe(id: string, input: RecipeInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").update(input).eq("id", id);

  if (error) return { error: "Impossibile salvare le modifiche." };

  revalidate();
  return { success: true };
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) return { error: "Impossibile eliminare la ricetta." };

  revalidate();
  return { success: true };
}
