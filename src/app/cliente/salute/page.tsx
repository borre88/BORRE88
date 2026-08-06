import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { computeLatestByMetric } from "@/lib/metrics";
import { SnapshotStrip } from "@/components/snapshot-strip";
import { MetricTabs } from "@/components/metric-tabs";
import { MeasurementsTable } from "@/components/measurements-table";
import { SectionIntro } from "@/components/ui";

export default async function SalutePage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", session!.user.id)
    .single();

  if (!client) {
    return (
      <div>
        <SectionIntro
          title="I miei dati"
          subtitle="Le rilevazioni inserite dal tuo trainer appariranno qui."
        />
        <p className="text-sm text-ink-faint">
          Il tuo trainer non ha ancora collegato una scheda cliente al tuo account. Contattalo per
          maggiori informazioni.
        </p>
      </div>
    );
  }

  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .eq("client_id", client.id)
    .order("date", { ascending: true });

  const entries = measurements ?? [];
  const latest = computeLatestByMetric(entries);

  return (
    <div>
      <SectionIntro
        title="I miei dati"
        subtitle="L'andamento delle rilevazioni registrate dal tuo trainer nel tempo."
      />
      <SnapshotStrip latest={latest} />
      <MetricTabs entries={entries} />
      <MeasurementsTable entries={entries} />
    </div>
  );
}
