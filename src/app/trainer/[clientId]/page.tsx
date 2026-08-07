import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeLatestByMetric, METRIC_GROUPS } from "@/lib/metrics";
import { SnapshotStrip } from "@/components/snapshot-strip";
import { MetricChart } from "@/components/metric-chart";
import { MeasurementsTable } from "@/components/measurements-table";
import { AreaTabs } from "@/components/area-tabs";
import { HealthScoreCard, type HealthArea } from "@/components/health-score-card";
import { CardioStats, AnthropometryStats } from "@/components/computed-stats";
import { AddMeasurementModal } from "./add-measurement-modal";
import { DeleteMeasurementButton } from "./delete-measurement-button";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender, phone, email")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .eq("client_id", clientId)
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
        <MeasurementsTable
          entries={entries}
          metrics={group.metrics}
          renderRowActions={(e) => <DeleteMeasurementButton clientId={clientId} measurementId={e.id} />}
        />
      </div>
    ),
  }));

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-0.5 text-[10.5px] font-semibold tracking-wide text-gold">SCHEDA ATLETA</div>
          <h1 className="font-display text-[32px] font-bold leading-none">{client.full_name}</h1>
          <p className="mt-1.5 text-xs text-ink-faint">
            {age !== null ? `${age} anni` : "Data di nascita non impostata"}
            {gender ? ` · ${gender}` : ""}
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
        </div>
        <AddMeasurementModal clientId={clientId} latest={latest} latestActivityLevel={latestMeasurement?.activity_level ?? null} />
      </div>

      {latestMeasurement?.trainer_notes && (
        <div className="mb-5 rounded-lg border border-dashed border-gold bg-gold-soft px-4 py-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-gold">
            Note ({new Date(latestMeasurement.date + "T00:00:00").toLocaleDateString("it-IT")}) — solo tu le vedi
          </div>
          <p className="whitespace-pre-line text-[13px] text-ink-soft">{latestMeasurement.trainer_notes}</p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface px-8 py-8 text-center text-sm text-ink-faint">
          Nessuna rilevazione registrata. Aggiungi la prima per iniziare a vedere l&apos;andamento.
        </div>
      ) : (
        <AreaTabs tabs={tabs} />
      )}
    </div>
  );
}
