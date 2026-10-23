"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PATH = "/trainer/raccomandazioni";

export interface RecommendationInput {
  title: string;
  body: string;
}

export async function createRecommendation(input: RecommendationInput) {
  const session = await getSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recommendations")
    .insert({ ...input, trainer_id: session!.user.id })
    .select("id")
    .single();

  if (error) return { error: "Impossibile creare la raccomandazione." };

  revalidatePath(PATH);
  return { recommendationId: data.id };
}

export async function updateRecommendation(id: string, input: RecommendationInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("recommendations").update(input).eq("id", id);

  if (error) return { error: "Impossibile salvare le modifiche." };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteRecommendation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recommendations").delete().eq("id", id);

  if (error) return { error: "Impossibile eliminare la raccomandazione." };

  revalidatePath(PATH);
  return { success: true };
}
