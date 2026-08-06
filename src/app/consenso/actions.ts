"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function acceptConsent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase
    .from("profiles")
    .update({ privacy_accepted_at: now, health_data_consent_at: now })
    .eq("id", session.user.id);

  redirect("/cliente");
}
