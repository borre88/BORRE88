import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeFullReport } from "@/lib/health-report";
import { TopBar } from "@/components/top-bar";
import { SplashGate } from "@/components/splash-gate";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("cliente");

  if (!session.profile.privacy_accepted_at || !session.profile.health_data_consent_at) {
    redirect("/consenso");
  }

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, date_of_birth, gender")
    .eq("profile_id", session.user.id)
    .single();

  let scores: number[] | undefined;
  if (client) {
    const { data: measurements } = await supabase
      .from("measurements")
      .select("*")
      .eq("client_id", client.id)
      .order("date", { ascending: true });
    const entries = measurements ?? [];
    const latestMeasurement = entries.length ? entries[entries.length - 1] : null;
    if (latestMeasurement) {
      const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
      const gender = (client.gender as Gender | null) ?? null;
      const areas = computeFullReport(latestMeasurement, gender, age);
      const areaScores = areas.map((a) => a.result?.score).filter((s): s is number => s !== null && s !== undefined);
      if (areaScores.length === 5) scores = areaScores;
    }
  }

  return (
    <SplashGate scores={scores}>
      <div className="min-h-screen bg-cream">
        <TopBar
          name={session.profile.full_name ?? session.user.email ?? "Cliente"}
          roleLabel="Area Cliente"
          showInstallHint
          guidaHref="/cliente/guida"
        />
        <main className="mx-auto max-w-3xl px-5 pb-14 pt-6 sm:px-7">{children}</main>
      </div>
    </SplashGate>
  );
}
