import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeLatestByMetric } from "@/lib/metrics";
import { SnapshotStrip } from "@/components/snapshot-strip";
import { MetricTabs } from "@/components/metric-tabs";
import { MeasurementsTable } from "@/components/measurements-table";
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
    .select("id, full_name")
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

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-0.5 text-[10.5px] font-semibold tracking-wide text-gold">SCHEDA ATLETA</div>
          <h1 className="font-display text-[32px] font-bold leading-none">{client.full_name}</h1>
        </div>
        <AddMeasurementModal clientId={clientId} />
      </div>

      <SnapshotStrip latest={latest} />
      <MetricTabs entries={entries} />
      <MeasurementsTable
        entries={entries}
        renderRowActions={(e) => (
          <DeleteMeasurementButton clientId={clientId} measurementId={e.id} />
        )}
      />
    </div>
  );
}
