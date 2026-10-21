"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentType } from "@/lib/appointments";

export interface ActionState {
  error?: string;
  success?: boolean;
}

/** Aggiunge giorni*7 a una data "YYYY-MM-DD" senza problemi di fuso orario. */
function addWeeks(dateIso: string, weeks: number): string {
  const d = new Date(dateIso + "T00:00:00");
  d.setDate(d.getDate() + weeks * 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function createAppointment(input: {
  clientId: string;
  type: AppointmentType;
  title: string;
  date: string;
  notes: string | null;
  recurrenceWeeks: number | null;
  occurrences: number;
}): Promise<ActionState> {
  const title = input.title.trim();
  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!input.clientId) return { error: "Seleziona un cliente." };
  if (!input.date) return { error: "Seleziona una data." };

  const supabase = await createClient();

  const occurrences =
    input.recurrenceWeeks && input.occurrences > 1 ? Math.min(52, Math.max(2, input.occurrences)) : 1;
  const seriesId = occurrences > 1 ? randomUUID() : null;

  const rows = Array.from({ length: occurrences }, (_, i) => ({
    client_id: input.clientId,
    type: input.type,
    title,
    date: input.recurrenceWeeks ? addWeeks(input.date, i * input.recurrenceWeeks) : input.date,
    notes: input.notes?.trim() || null,
    series_id: seriesId,
  }));

  const { error } = await supabase.from("client_appointments").insert(rows);
  if (error) return { error: "Impossibile salvare la scadenza." };

  revalidatePath("/trainer/calendario");
  revalidatePath("/trainer");
  return { success: true };
}

export async function toggleAppointmentCompleted(id: string, completed: boolean) {
  const supabase = await createClient();
  await supabase.from("client_appointments").update({ completed }).eq("id", id);
  revalidatePath("/trainer/calendario");
  revalidatePath("/trainer");
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  await supabase.from("client_appointments").delete().eq("id", id);
  revalidatePath("/trainer/calendario");
  revalidatePath("/trainer");
}

export async function deleteAppointmentSeries(seriesId: string) {
  const supabase = await createClient();
  await supabase.from("client_appointments").delete().eq("series_id", seriesId);
  revalidatePath("/trainer/calendario");
  revalidatePath("/trainer");
}
