import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, privacy_accepted_at, health_data_consent_at")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { user, profile };
});

export async function requireRole(role: "trainer" | "cliente") {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== role) {
    redirect(session.profile.role === "trainer" ? "/trainer" : "/cliente");
  }
  return session;
}
