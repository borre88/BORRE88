import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, FlaskConical, Truck, Pill } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeLatestByMetric, METRIC_GROUPS } from "@/lib/metrics";
import { computeFullReport } from "@/lib/health-report";
import { SnapshotStrip } from "@/components/snapshot-strip";
import { MetricChart } from "@/components/metric-chart";
import { MeasurementsTable } from "@/components/measurements-table";
import { AreaTabs } from "@/components/area-tabs";
import { HealthScoreCard, type HealthArea } from "@/components/health-score-card";
import { HealthReportView } from "@/components/health-report-view";
import { CardioStats, AnthropometryStats } from "@/components/computed-stats";
import { BodyMeasurementsCard } from "@/components/body-measurements-card";
import { WeeklyCheckinsTable } from "@/components/weekly-checkins-table";
import { AddMeasurementModal } from "./add-measurement-modal";
import { DeleteMeasurementButton } from "./delete-measurement-button";
import { EditProfileModal } from "./edit-profile-modal";
import { MarkCheckinsSeen } from "./mark-checkins-seen";
import { MarkDeliveryFulfilledButton } from "./mark-delivery-fulfilled-button";
import { MarkSupplementFulfilledButton } from "./mark-supplement-fulfilled-button";

const DELIVERY_GOAL_LABELS: Record<string, string> = {
  definizione: "Definizione",
  mantenimento: "Mantenimento",
  massa: "Massa",
};

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  nuova: "Nuova",
  in_lavorazione: "In lavorazione",
  attiva: "Attiva",
  conclusa: "Conclusa",
};

const DELIVERY_MEAL_LABELS: Record<string, string> = {
  colazione: "Colazione",
  spuntini: "Spuntini",
  pranzo: "Pranzo",
  cena: "Cena",
};

const DELIVERY_AREA_LABELS: Record<string, string> = {
  milano: "Milano",
  hinterland: "Hinterland",
  provincia: "Provincia di Milano",
};

const DELIVERY_DAY_LABELS: Record<string, string> = {
  lun: "Lun",
  mar: "Mar",
  mer: "Mer",
  gio: "Gio",
  ven: "Ven",
  sab: "Sab",
  dom: "Dom",
};

const SUPPLEMENT_STATUS_LABELS: Record<string, string> = {
  nuova: "Nuova",
  in_lavorazione: "In lavorazione",
  conclusa: "Conclusa",
};

const SUPPLEMENT_PRODUCT_LABELS: Record<string, string> = {
  whey: "Proteine Whey",
  isolate: "Isolato proteico",
  creatina: "Creatina monoidrato",
  omega3: "Omega-3",
  multivitaminico: "Multivitaminico",
  bcaa: "BCAA / EAA",
  preworkout: "Pre-workout",
  collagene: "Collagene",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender, phone, email, group_name")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: allGroups } = await supabase.from("clients").select("group_name").not("group_name", "is", null);
  const existingGroups = Array.from(new Set((allGroups ?? []).map((g) => g.group_name as string))).sort((a, b) =>
    a.localeCompare(b)
  );

  const { data: measurements } = await supabase
    .from("measurements")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: true });

  const { data: weeklyCheckins } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", clientId)
    .order("week_start", { ascending: false })
    .limit(8);

  const { data: allWeeklyCheckins } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("client_id", clientId)
    .order("week_start", { ascending: true });

  const { data: deliveryRequests } = await supabase
    .from("delivery_requests")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: supplementRequests } = await supabase
    .from("supplement_requests")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(5);

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
          <>
            <AnthropometryStats measurement={latestMeasurement} age={age} gender={gender} />
            <BodyMeasurementsCard checkins={allWeeklyCheckins ?? []} gender={gender} />
          </>
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

  tabs.push({
    key: "report",
    label: "Report",
    content: (
      <div>
        <div className="mb-4 flex justify-end">
          <Link
            href={`/trainer/${clientId}/report`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft"
          >
            <FileText size={14} strokeWidth={2.2} />
            Apri per scaricare in PDF
          </Link>
        </div>
        <HealthReportView
          clientName={client.full_name}
          reportDate={latestMeasurement?.date ?? null}
          areas={computeFullReport(latestMeasurement, gender, age)}
        />
      </div>
    ),
  });

  return (
    <div>
      <MarkCheckinsSeen clientId={clientId} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-0.5 text-[10.5px] font-semibold tracking-wide text-gold">SCHEDA ATLETA</div>
          <h1 className="font-display text-[32px] font-bold leading-none">{client.full_name}</h1>
          <p className="mt-1.5 text-xs text-ink-faint">
            {age !== null ? `${age} anni` : "Data di nascita non impostata"}
            {gender ? ` · ${gender}` : ""}
            {client.phone ? ` · ${client.phone}` : ""}
            {client.group_name ? ` · ${client.group_name}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EditProfileModal
            clientId={clientId}
            client={{
              full_name: client.full_name,
              phone: client.phone,
              date_of_birth: client.date_of_birth,
              gender: client.gender,
              group_name: client.group_name,
            }}
            existingGroups={existingGroups}
          />
          <Link
            href={`/trainer/${clientId}/esami-sangue`}
            className="flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            <FlaskConical size={15} strokeWidth={2.2} />
            Esami del sangue
          </Link>
          <AddMeasurementModal
            clientId={clientId}
            latest={latest}
            latestActivityLevel={latestMeasurement?.activity_level ?? null}
          />
        </div>
      </div>

      {latestMeasurement?.trainer_notes && (
        <div className="mb-5 rounded-lg border border-dashed border-gold bg-gold-soft px-4 py-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-gold">
            Note ({new Date(latestMeasurement.date + "T00:00:00").toLocaleDateString("it-IT")}) — solo tu le vedi
          </div>
          <p className="whitespace-pre-line text-[13px] text-ink-soft">{latestMeasurement.trainer_notes}</p>
        </div>
      )}

      {weeklyCheckins && weeklyCheckins.length > 0 && (
        <div className="mb-5">
          <WeeklyCheckinsTable checkins={weeklyCheckins} />
        </div>
      )}

      {deliveryRequests && deliveryRequests.length > 0 && (
        <div className="mb-5 rounded-lg border border-line bg-surface px-4 pb-2 pt-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <Truck size={15} strokeWidth={2.2} className="text-teal" />
            Richieste delivery a domicilio
          </div>
          <div className="space-y-2 pb-2.5">
            {deliveryRequests.map((r) => (
              <div key={r.id} className="rounded-lg border border-line bg-cream px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-ink">
                    {DELIVERY_STATUS_LABELS[r.status] ?? r.status}
                    {r.goal && ` · obiettivo ${DELIVERY_GOAL_LABELS[r.goal] ?? r.goal}`}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-faint">
                    {new Date(r.created_at).toLocaleDateString("it-IT")}
                  </span>
                </div>
                {r.preferences && <p className="mt-1 text-[12px] text-ink-soft">Gusti: {r.preferences}</p>}
                {r.meals && r.meals.length > 0 && (
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    Pasti interessati: {r.meals.map((m) => DELIVERY_MEAL_LABELS[m] ?? m).join(", ")}
                  </p>
                )}
                {(r.meals_per_week || r.deliveries_per_week) && (
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    {r.meals_per_week && `${r.meals_per_week} pasti/settimana`}
                    {r.meals_per_week && r.deliveries_per_week && " · "}
                    {r.deliveries_per_week && `${r.deliveries_per_week} consegne/settimana`}
                  </p>
                )}
                {r.delivery_area && (
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    Area: {DELIVERY_AREA_LABELS[r.delivery_area] ?? r.delivery_area}
                  </p>
                )}
                {r.preferred_days && r.preferred_days.length > 0 && (
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    Giorni preferiti: {r.preferred_days.map((d) => DELIVERY_DAY_LABELS[d] ?? d).join(", ")}
                  </p>
                )}
                {r.preferred_time && <p className="mt-0.5 text-[12px] text-ink-soft">Orari preferiti: {r.preferred_time}</p>}
                {r.notes && <p className="mt-0.5 text-[12px] text-ink-soft">Altre richieste: {r.notes}</p>}
                {r.status !== "conclusa" && (
                  <div className="mt-2">
                    <MarkDeliveryFulfilledButton clientId={clientId} requestId={r.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {supplementRequests && supplementRequests.length > 0 && (
        <div className="mb-5 rounded-lg border border-line bg-surface px-4 pb-2 pt-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <Pill size={15} strokeWidth={2.2} className="text-teal" />
            Richieste integratori (Mowe Nutrition)
          </div>
          <div className="space-y-2 pb-2.5">
            {supplementRequests.map((r) => (
              <div key={r.id} className="rounded-lg border border-line bg-cream px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-ink">
                    {SUPPLEMENT_STATUS_LABELS[r.status] ?? r.status}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-faint">
                    {new Date(r.created_at).toLocaleDateString("it-IT")}
                  </span>
                </div>
                {r.items && r.items.length > 0 && (
                  <p className="mt-1 text-[12px] text-ink-soft">
                    Prodotti: {r.items.map((i) => SUPPLEMENT_PRODUCT_LABELS[i] ?? i).join(", ")}
                  </p>
                )}
                {r.notes && <p className="mt-0.5 text-[12px] text-ink-soft">Note: {r.notes}</p>}
                {r.status !== "conclusa" && (
                  <div className="mt-2">
                    <MarkSupplementFulfilledButton clientId={clientId} requestId={r.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
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
