"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/cliente/nutrizione/delivery";

export interface DeliveryActionState {
  error?: string;
  success?: boolean;
}

export async function submitDeliveryRequest(
  _prevState: DeliveryActionState | undefined,
  formData: FormData
): Promise<DeliveryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Devi essere autenticato." };

  const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).single();
  if (!client) return { error: "Nessuna scheda cliente collegata al tuo account." };

  const goal = String(formData.get("goal") ?? "").trim() || null;
  const preferences = String(formData.get("preferences") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.from("delivery_requests").insert({
    client_id: client.id,
    goal,
    preferences,
    notes,
  });

  if (error) return { error: "Impossibile inviare la richiesta." };

  revalidatePath(PATH);
  revalidatePath("/trainer");
  return { success: true };
}
