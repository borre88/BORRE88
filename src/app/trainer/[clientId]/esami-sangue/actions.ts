"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BLOOD_MARKERS } from "@/lib/blood-markers";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function addBloodTest(
  clientId: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const testDate = String(formData.get("test_date") ?? "");
  if (!testDate) return { error: "La data dell'esame è obbligatoria." };

  const labName = String(formData.get("lab_name") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data: test, error: testErr } = await supabase
    .from("blood_tests")
    .insert({ client_id: clientId, test_date: testDate, lab_name: labName, notes })
    .select("id")
    .single();

  if (testErr || !test) return { error: "Impossibile salvare l'esame." };

  const values = BLOOD_MARKERS.map((marker) => {
    const raw = formData.get(marker.key);
    if (raw === null || raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return { blood_test_id: test.id, marker_key: marker.key, value: n };
  }).filter((v): v is { blood_test_id: string; marker_key: string; value: number } => v !== null);

  if (values.length > 0) {
    const { error: valuesErr } = await supabase.from("blood_test_values").insert(values);
    if (valuesErr) {
      await supabase.from("blood_tests").delete().eq("id", test.id);
      return { error: "Impossibile salvare i valori dell'esame." };
    }
  }

  revalidatePath(`/trainer/${clientId}/esami-sangue`);
  return { success: true };
}

export async function deleteBloodTest(clientId: string, testId: string) {
  const supabase = await createClient();
  await supabase.from("blood_tests").delete().eq("id", testId);
  revalidatePath(`/trainer/${clientId}/esami-sangue`);
}
