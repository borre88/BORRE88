"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/cliente/integrazioni";

export interface SupplementActionState {
  error?: string;
  success?: boolean;
}

export async function submitSupplementRequest(
  _prevState: SupplementActionState | undefined,
  formData: FormData
): Promise<SupplementActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Devi essere autenticato." };

  const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).single();
  if (!client) return { error: "Nessuna scheda cliente collegata al tuo account." };

  const items = formData.getAll("items").map(String);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (items.length === 0 && !notes) {
    return { error: "Seleziona almeno un prodotto o scrivi una richiesta." };
  }

  const { error } = await supabase.from("supplement_requests").insert({
    client_id: client.id,
    items: items.length > 0 ? items : null,
    notes,
  });

  if (error) return { error: "Impossibile inviare la richiesta." };

  revalidatePath(PATH);
  revalidatePath("/trainer");
  return { success: true };
}
