"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function createIntakeForm(
  label: string | null,
  clientId: string | null
): Promise<ActionState & { link?: string }> {
  const session = await getSession();
  if (!session || session.profile.role !== "trainer") return { error: "Non autorizzato." };

  const token = randomBytes(24).toString("base64url");
  const supabase = await createClient();

  const { error } = await supabase.from("intake_forms").insert({
    trainer_id: session.user.id,
    client_id: clientId,
    token,
    label: label?.trim() || null,
  });

  if (error) return { error: "Impossibile creare il questionario." };

  revalidatePath("/trainer/questionari");
  if (clientId) revalidatePath(`/trainer/${clientId}`);
  return { success: true, link: `${siteUrl()}/questionario/${token}` };
}

export async function deleteIntakeForm(id: string) {
  const supabase = await createClient();
  await supabase.from("intake_forms").delete().eq("id", id);
  revalidatePath("/trainer/questionari");
}

/** Crea una scheda cliente a partire dall'anagrafica compilata nel questionario. */
export async function createClientFromIntake(formId: string): Promise<ActionState & { clientId?: string }> {
  const session = await getSession();
  if (!session || session.profile.role !== "trainer") return { error: "Non autorizzato." };

  const supabase = await createClient();
  const { data: form } = await supabase.from("intake_forms").select("*").eq("id", formId).single();
  if (!form) return { error: "Questionario non trovato." };

  const anagrafica = (form.data as Record<string, unknown>)?.anagrafica as Record<string, string> | undefined;
  if (!anagrafica?.nome) return { error: "Il questionario non ha un'anagrafica compilata." };

  const fullName = [anagrafica.nome, anagrafica.cognome].filter(Boolean).join(" ").trim();
  const genderRaw = anagrafica.sesso;
  const gender = genderRaw === "maschio" || genderRaw === "femmina" ? genderRaw : null;

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      trainer_id: session.user.id,
      full_name: fullName || "Nuovo cliente",
      email: anagrafica.email || null,
      phone: anagrafica.telefono || null,
      date_of_birth: anagrafica.data_nascita || null,
      gender,
    })
    .select("id")
    .single();

  if (error || !client) return { error: "Impossibile creare il cliente." };

  await supabase.from("intake_forms").update({ client_id: client.id }).eq("id", formId);

  revalidatePath("/trainer");
  revalidatePath("/trainer/questionari");
  return { success: true, clientId: client.id };
}
