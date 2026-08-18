"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendWorkoutAssignedEmail } from "@/lib/email";

export interface WorkoutAssignmentInput {
  name: string;
  category: string | null;
  duration_minutes: number | null;
  notes: string | null;
  exercises: { name: string; sets: number; reps: string; rest: string }[];
}

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function upsertWorkoutAssignment(
  clientId: string,
  date: string,
  data: WorkoutAssignmentInput
): Promise<ActionState> {
  const name = data.name.trim();
  if (!name) return { error: "Il nome dell'allenamento è obbligatorio." };

  const supabase = await createClient();

  await supabase.from("workout_assignments").delete().eq("client_id", clientId).eq("date", date);

  const { data: created, error } = await supabase
    .from("workout_assignments")
    .insert({
      client_id: clientId,
      date,
      name,
      category: data.category?.trim() || null,
      duration_minutes: data.duration_minutes,
      notes: data.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !created) return { error: "Impossibile salvare l'allenamento." };

  const rows = data.exercises
    .filter((e) => e.name.trim())
    .map((e, i) => ({
      assignment_id: created.id,
      name: e.name.trim(),
      sets: e.sets,
      reps: e.reps.trim() || "-",
      rest: e.rest.trim() || "-",
      position: i,
    }));

  if (rows.length > 0) {
    const { error: exErr } = await supabase.from("workout_assignment_exercises").insert(rows);
    if (exErr) return { error: "Allenamento salvato, ma non è stato possibile salvare gli esercizi." };
  }

  const { data: client } = await supabase.from("clients").select("email, full_name").eq("id", clientId).single();
  if (client?.email) {
    try {
      await sendWorkoutAssignedEmail(client.email, client.full_name, name, date);
    } catch {
      // L'email è un extra: non deve far fallire il salvataggio dell'allenamento.
    }
  }

  revalidatePath(`/trainer/${clientId}/allenamenti`);
  revalidatePath("/cliente/allenamenti");
  return { success: true };
}

export async function deleteWorkoutAssignment(clientId: string, assignmentId: string) {
  const supabase = await createClient();
  await supabase.from("workout_assignments").delete().eq("id", assignmentId);
  revalidatePath(`/trainer/${clientId}/allenamenti`);
  revalidatePath("/cliente/allenamenti");
}
