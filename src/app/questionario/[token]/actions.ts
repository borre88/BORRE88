"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { IntakeFormData } from "@/lib/intake-form";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function submitIntakeForm(token: string, data: IntakeFormData): Promise<ActionState> {
  if (!data.consenso?.privacy || !data.consenso?.dati_salute) {
    return { error: "Devi accettare l'informativa privacy e il consenso al trattamento dei dati sulla salute." };
  }

  const admin = createAdminClient();

  const { data: form } = await admin.from("intake_forms").select("id, status").eq("token", token).maybeSingle();
  if (!form) return { error: "Link non valido." };
  if (form.status === "completed") return { error: "Questo questionario è già stato inviato." };

  const { error } = await admin
    .from("intake_forms")
    .update({ data, status: "completed", completed_at: new Date().toISOString() })
    .eq("id", form.id);

  if (error) return { error: "Impossibile salvare il questionario. Riprova." };

  return { success: true };
}
