"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_METRICS } from "@/lib/metrics";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function createClientAccount(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const genderRaw = String(formData.get("gender") ?? "");
  const gender = genderRaw === "maschio" || genderRaw === "femmina" ? genderRaw : null;
  const groupName = String(formData.get("group_name") ?? "").trim() || null;

  if (!fullName || !email || !dateOfBirth || !phone || !gender) {
    return { error: "Nome, email, telefono, data di nascita e sesso sono obbligatori." };
  }

  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(),
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created.user) {
    const alreadyExists = createErr?.message?.toLowerCase().includes("already");
    return {
      error: alreadyExists
        ? "Esiste già un account con questa email."
        : "Impossibile creare l'account del cliente.",
    };
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ role: "cliente", full_name: fullName })
    .eq("id", created.user.id);

  const { error: insertErr } = await supabase.from("clients").insert({
    trainer_id: user.id,
    profile_id: created.user.id,
    full_name: fullName,
    email,
    date_of_birth: dateOfBirth,
    phone,
    gender,
    group_name: groupName,
  });

  if (profileErr || insertErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Impossibile salvare la scheda cliente." };
  }

  await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/imposta-password`,
  });

  revalidatePath("/trainer");
  return { success: true };
}

export async function deleteClientAccount(clientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("profile_id")
    .eq("id", clientId)
    .single();

  await supabase.from("clients").delete().eq("id", clientId);

  if (client?.profile_id) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(client.profile_id);
  }

  revalidatePath("/trainer");
  redirect("/trainer");
}

export async function addMeasurement(
  clientId: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const date = String(formData.get("date") ?? "");
  if (!date) return { error: "La data è obbligatoria." };

  const numeric = (key: string) => {
    const raw = formData.get(key);
    if (raw === null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const numericFields = Object.fromEntries(ALL_METRICS.map((m) => [m.key, numeric(m.key)]));

  const activityLevelRaw = String(formData.get("activity_level") ?? "");
  const activityLevel = ["sedentario", "leggero", "moderato", "intenso", "molto_intenso"].includes(
    activityLevelRaw
  )
    ? activityLevelRaw
    : null;

  const trainerNotes = String(formData.get("trainer_notes") ?? "").trim() || null;

  const { error } = await supabase.from("measurements").upsert(
    {
      client_id: clientId,
      date,
      ...numericFields,
      activity_level: activityLevel,
      trainer_notes: trainerNotes,
    },
    { onConflict: "client_id,date" }
  );

  if (error) return { error: "Impossibile salvare la rilevazione." };

  revalidatePath(`/trainer/${clientId}`);
  return { success: true };
}

export async function deleteMeasurement(clientId: string, measurementId: string) {
  const supabase = await createClient();
  await supabase.from("measurements").delete().eq("id", measurementId);
  revalidatePath(`/trainer/${clientId}`);
}

export async function updateClientProfile(
  clientId: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();
  const genderRaw = String(formData.get("gender") ?? "");
  const gender = genderRaw === "maschio" || genderRaw === "femmina" ? genderRaw : null;
  const groupName = String(formData.get("group_name") ?? "").trim() || null;

  if (!fullName || !phone || !dateOfBirth || !gender) {
    return { error: "Nome, telefono, data di nascita e sesso sono obbligatori." };
  }

  const { error } = await supabase
    .from("clients")
    .update({ full_name: fullName, phone, date_of_birth: dateOfBirth, gender, group_name: groupName })
    .eq("id", clientId);

  if (error) return { error: "Impossibile salvare il profilo." };

  revalidatePath(`/trainer/${clientId}`);
  revalidatePath("/trainer");
  return { success: true };
}

export async function markDeliveryRequestFulfilled(clientId: string, requestId: string) {
  const supabase = await createClient();
  await supabase.from("delivery_requests").update({ status: "conclusa" }).eq("id", requestId);
  revalidatePath(`/trainer/${clientId}`);
  revalidatePath("/trainer");
  revalidatePath("/cliente/delivery");
}

export async function markCheckinsSeen(clientId: string) {
  const supabase = await createClient();
  await supabase
    .from("weekly_checkins")
    .update({ viewed_by_trainer_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("viewed_by_trainer_at", null);
  await supabase
    .from("delivery_requests")
    .update({ viewed_by_trainer_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("viewed_by_trainer_at", null);
  revalidatePath("/trainer");
}
