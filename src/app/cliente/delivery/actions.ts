"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/cliente/delivery";

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
  const meals = formData.getAll("meals").map(String);
  const preferredDays = formData.getAll("preferred_days").map(String);
  const preferredTime = String(formData.get("preferred_time") ?? "").trim() || null;
  const deliveryArea = String(formData.get("delivery_area") ?? "").trim() || null;
  const mealsPerWeek = Number(formData.get("meals_per_week"));
  const deliveriesPerWeek = Number(formData.get("deliveries_per_week"));

  const { error } = await supabase.from("delivery_requests").insert({
    client_id: client.id,
    goal,
    preferences,
    notes,
    meals: meals.length > 0 ? meals : null,
    preferred_days: preferredDays.length > 0 ? preferredDays : null,
    preferred_time: preferredTime,
    delivery_area: deliveryArea,
    meals_per_week: Number.isFinite(mealsPerWeek) && mealsPerWeek > 0 ? mealsPerWeek : null,
    deliveries_per_week: Number.isFinite(deliveriesPerWeek) && deliveriesPerWeek > 0 ? deliveriesPerWeek : null,
  });

  if (error) return { error: "Impossibile inviare la richiesta." };

  revalidatePath(PATH);
  revalidatePath("/trainer");
  return { success: true };
}
