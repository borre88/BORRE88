"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PATH = "/trainer/integratori";

export interface SupplementInput {
  name: string;
  brand: string | null;
  category: string | null;
  format: string | null;
  package_size: string | null;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  product_url: string | null;
  serving_size: string | null;
  suggested_use: string | null;
  ingredients: string | null;
  flavors: string | null;
  notes: string | null;
}

export async function createSupplement(input: SupplementInput) {
  const session = await getSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("supplements")
    .insert({ ...input, trainer_id: session!.user.id })
    .select("id")
    .single();

  if (error) return { error: "Impossibile creare l'integratore." };

  revalidatePath(PATH);
  revalidatePath("/cliente/integrazioni");
  return { supplementId: data.id };
}

export async function updateSupplement(id: string, input: SupplementInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("supplements").update(input).eq("id", id);

  if (error) return { error: "Impossibile salvare le modifiche." };

  revalidatePath(PATH);
  revalidatePath("/cliente/integrazioni");
  return { success: true };
}

export async function deleteSupplement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("supplements").delete().eq("id", id);

  if (error) return { error: "Impossibile eliminare l'integratore." };

  revalidatePath(PATH);
  revalidatePath("/cliente/integrazioni");
  return { success: true };
}
