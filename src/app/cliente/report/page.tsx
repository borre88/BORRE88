import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeFullReport } from "@/lib/health-report";
import { HealthReportView } from "@/components/health-report-view";
import { BodyMeasurementsSummary } from "@/components/body-measurements-summary";
import { PrintButton } from "@/components/print-button";
import { ReportHeader } from "@/components/report-header";
import { ReportFooter } from "@/components/report-footer";
import { SectionIntro } from "@/components/ui";

export default async function ClientReportPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender")
    .eq("profile_id", session!.user.id)
    .single();

  if (!client) {
    return (
      <div>
        <SectionIntro title="Report" subtitle="Il tuo report generale apparirà qui." />
        <p className="text-sm text-ink-faint">
          Il tuo trainer non ha ancora collegato una scheda cliente al tuo account.
        </p>
      </div>
    );
  }

  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .eq("client_id", client.id)
    .order("date", { ascending: true });

  const { data: weeklyCheckins } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", client.id)
    .order("week_start", { ascending: true });

  const entries = measurements ?? [];
  const latestMeasurement = entries.length ? entries[entries.length - 1] : null;
  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
  const gender = (client.gender as Gender | null) ?? null;

  const areas = computeFullReport(latestMeasurement, gender, age);

  return (
    <div className="report-light mx-auto max-w-2xl px-5 py-8">
      <ReportHeader />
      <div className="mb-5 flex justify-end">
        <PrintButton />
      </div>
      <HealthReportView
        clientName={client.full_name}
        reportDate={latestMeasurement?.date ?? null}
        areas={areas}
        forcePrintColors
      />
      <BodyMeasurementsSummary checkins={weeklyCheckins ?? []} gender={gender} />
      <ReportFooter />
    </div>
  );
}
