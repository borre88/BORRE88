import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeFullReport } from "@/lib/health-report";
import { HealthReportView } from "@/components/health-report-view";
import { BodyMeasurementsSummary } from "@/components/body-measurements-summary";
import { PrintButton } from "@/components/print-button";
import { ReportHeader } from "@/components/report-header";
import { ReportFooter } from "@/components/report-footer";

export default async function ClientReportPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: true });

  const { data: weeklyCheckins } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", clientId)
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
