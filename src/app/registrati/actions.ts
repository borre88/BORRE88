"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SignupState {
  error?: string;
}

export async function signUpClient(
  _prevState: SignupState | undefined,
  formData: FormData
): Promise<SignupState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const genderRaw = String(formData.get("gender") ?? "");
  const gender = genderRaw === "maschio" || genderRaw === "femmina" ? genderRaw : null;

  if (!fullName || !email || !password || !dateOfBirth || !phone || !gender) {
    return { error: "Compila tutti i campi obbligatori." };
  }
  if (password.length < 6) {
    return { error: "La password deve avere almeno 6 caratteri." };
  }
  if (password !== passwordConfirm) {
    return { error: "Le due password non coincidono." };
  }

  const admin = createAdminClient();

  const { data: trainer } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "trainer")
    .limit(1)
    .maybeSingle();

  if (!trainer) {
    return { error: "Nessun trainer configurato. Contatta l'assistenza." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created.user) {
    const alreadyExists = createErr?.message?.toLowerCase().includes("already");
    return {
      error: alreadyExists ? "Esiste già un account con questa email." : "Impossibile creare l'account.",
    };
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ role: "cliente", full_name: fullName })
    .eq("id", created.user.id);

  const { error: insertErr } = await admin.from("clients").insert({
    trainer_id: trainer.id,
    profile_id: created.user.id,
    full_name: fullName,
    email,
    date_of_birth: dateOfBirth,
    phone,
    gender,
  });

  if (profileErr || insertErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Impossibile salvare la scheda cliente." };
  }

  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) {
    redirect("/login");
  }

  redirect("/consenso");
}
