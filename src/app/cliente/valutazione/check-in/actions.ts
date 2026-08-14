"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMondayISO } from "@/lib/dates";
import { BODY_MEASUREMENT_FIELDS } from "@/components/body-measurements-card";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function submitWeeklyCheckin(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!client) return { error: "Nessuna scheda cliente collegata al tuo account." };

  const numeric = (key: string) => {
    const raw = formData.get(key);
    if (raw === null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const weekStart = getMondayISO(new Date());

  const bodyMeasurements = Object.fromEntries(BODY_MEASUREMENT_FIELDS.map((f) => [f.key, numeric(f.key)]));

  const { error } = await supabase.from("weekly_checkins").upsert(
    {
      client_id: client.id,
      week_start: weekStart,
      weight_kg: numeric("weight_kg"),
      workouts_count: numeric("workouts_count"),
      sleep_hours: numeric("sleep_hours"),
      stress_level: numeric("stress_level"),
      tiredness: numeric("tiredness"),
      energy: numeric("energy"),
      diet_slips: numeric("diet_slips"),
      notes,
      ...bodyMeasurements,
    },
    { onConflict: "client_id,week_start" }
  );

  if (error) return { error: "Impossibile salvare il check-in." };

  revalidatePath("/cliente/valutazione/check-in");
  revalidatePath("/trainer");
  return { success: true };
}
