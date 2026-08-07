import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeLatestByMetric, METRIC_GROUPS } from "@/lib/metrics";
import { SnapshotStrip } from "@/components/snapshot-strip";
import { MetricChart } from "@/components/metric-chart";
import { MeasurementsTable } from "@/components/measurements-table";
import { AreaTabs } from "@/components/area-tabs";
import { HealthScoreCard, type HealthArea } from "@/components/health-score-card";
import { CardioStats, AnthropometryStats } from "@/components/computed-stats";
import { SectionIntro } from "@/components/ui";

export default async function SalutePage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, date_of_birth, gender")
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
  const latestMeasurement = entries.length ? entries[entries.length - 1] : null;
  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
  const gender = (client.gender as Gender | null) ?? null;

  const tabs = METRIC_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    content: (
      <div>
        <p className="mb-4 text-[12.5px] text-ink-faint">{group.description}</p>
        {group.key === "cardio" && <CardioStats measurement={latestMeasurement} age={age} />}
        {group.key === "antropometria" && (
          <AnthropometryStats measurement={latestMeasurement} age={age} gender={gender} />
        )}
        <HealthScoreCard
          area={group.key as HealthArea}
          measurement={latestMeasurement}
          gender={gender}
          age={age}
        />
        <SnapshotStrip latest={latest} metrics={group.metrics} />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {group.metrics.map((m) => {
            const data = entries
              .filter((e) => e[m.key] !== null && e[m.key] !== undefined)
              .map((e) => ({ date: e.date, value: Number(e[m.key]) }));
            return <MetricChart key={m.key} metric={m} data={data} />;
          })}
        </div>
        <MeasurementsTable entries={entries} metrics={group.metrics} />
      </div>
    ),
  }));

  return (
    <div>
      <SectionIntro
        title="I miei dati"
        subtitle="L'andamento delle rilevazioni registrate dal tuo trainer nel tempo."
      />
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-8 py-8 text-center text-sm text-ink-faint">
          Il tuo trainer non ha ancora registrato rilevazioni.
        </div>
      ) : (
        <AreaTabs tabs={tabs} />
      )}
    </div>
  );
}
