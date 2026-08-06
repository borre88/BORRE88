"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  if (!fullName || !email) {
    return { error: "Nome ed email sono obbligatori." };
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

  const { error } = await supabase.from("measurements").upsert(
    {
      client_id: clientId,
      date,
      sleep_hours: numeric("sleep_hours"),
      resting_hr: numeric("resting_hr"),
      vo2max: numeric("vo2max"),
      squat_1rm: numeric("squat_1rm"),
      bench_1rm: numeric("bench_1rm"),
      deadlift_1rm: numeric("deadlift_1rm"),
      weight_kg: numeric("weight_kg"),
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
