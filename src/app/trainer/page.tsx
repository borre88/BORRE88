import Link from "next/link";
import { Bell, Truck, Pill, Users, UserCheck, ClipboardCheck, Apple, Utensils, CalendarClock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeIt, formatWeekLabel, toISODate } from "@/lib/dates";
import { formatDateIt } from "@/lib/metrics";
import { calculateAge, type Gender, type Measurement } from "@/lib/health-score";
import { computeFullReport, synthesizeReport } from "@/lib/health-report";
import type { Tables } from "@/lib/database.types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { appointmentTypeAccent, appointmentTypeLabel } from "@/lib/appointments";

const DELIVERY_GOAL_LABELS: Record<string, string> = {
  definizione: "Definizione",
  mantenimento: "Mantenimento",
  massa: "Massa",
};

type Notification =
  | { type: "checkin"; id: string; client_id: string; created_at: string; checkin: Tables<"weekly_checkins"> }
  | { type: "delivery"; id: string; client_id: string; created_at: string; delivery: Tables<"delivery_requests"> }
  | {
      type: "supplement";
      id: string;
      client_id: string;
      created_at: string;
      supplement: Tables<"supplement_requests">;
    };

function scoreColor(score: number) {
  if (score >= 15) return "text-good";
  if (score >= 10) return "text-gold";
  return "text-bad";
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
      <div className="min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
        <Icon size={16} strokeWidth={2.2} />
      </span>
    </div>
  );
}

export default async function TrainerHome() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender")
    .eq("trainer_id", session!.user.id)
    .order("full_name");

  const clientIds = (clients ?? []).map((c) => c.id);
  const nameById = new Map((clients ?? []).map((c) => [c.id, c.full_name]));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const todayIso = toISODate(new Date());
  const inSevenDays = new Date();
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const inSevenDaysIso = toISODate(inSevenDays);

  const [
    { data: unseenCheckins },
    { data: unseenDelivery },
    { data: unseenSupplement },
    { data: recentCheckins },
    { data: recentMeasurements },
    { count: foodsCount },
    { data: activeDietPlans },
    { data: upcomingAppointments },
  ] = clientIds.length
    ? await Promise.all([
        supabase
          .from("weekly_checkins")
          .select("*")
          .in("client_id", clientIds)
          .is("viewed_by_trainer_at", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("delivery_requests")
          .select("*")
          .in("client_id", clientIds)
          .is("viewed_by_trainer_at", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("supplement_requests")
          .select("*")
          .in("client_id", clientIds)
          .is("viewed_by_trainer_at", null)
          .order("created_at", { ascending: false }),
        supabase.from("weekly_checkins").select("client_id").in("client_id", clientIds).gte("created_at", thirtyDaysAgoIso),
        supabase
          .from("measurements")
          .select("client_id")
          .in("client_id", clientIds)
          .gte("date", thirtyDaysAgoIso.slice(0, 10)),
        supabase.from("foods").select("id", { count: "exact", head: true }),
        supabase.from("diet_plans").select("client_id").in("client_id", clientIds).eq("active", true),
        supabase
          .from("client_appointments")
          .select("*")
          .in("client_id", clientIds)
          .eq("completed", false)
          .lte("date", inSevenDaysIso)
          .order("date", { ascending: true }),
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { count: 0 },
        { data: [] },
        { data: [] },
      ];

  const activeClientIds = new Set<string>([
    ...(recentCheckins ?? []).map((c) => c.client_id),
    ...(recentMeasurements ?? []).map((m) => m.client_id),
  ]);
  const activeDietClientIds = new Set((activeDietPlans ?? []).map((p) => p.client_id));

  const notifications: Notification[] = [
    ...(unseenCheckins ?? []).map((c) => ({
      type: "checkin" as const,
      id: c.id,
      client_id: c.client_id,
      created_at: c.created_at,
      checkin: c,
    })),
    ...(unseenDelivery ?? []).map((d) => ({
      type: "delivery" as const,
      id: d.id,
      client_id: d.client_id,
      created_at: d.created_at,
      delivery: d,
    })),
    ...(unseenSupplement ?? []).map((s) => ({
      type: "supplement" as const,
      id: s.id,
      client_id: s.client_id,
      created_at: s.created_at,
      supplement: s,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const todayLabel = new Date()
    .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  const firstName = (session!.profile.full_name ?? "").split(" ")[0] || "Dottore";

  if (!clients || clients.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Crea il tuo primo cliente</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-faint">
          I dati di sonno, VO2max, massimali e peso appariranno qui, con l&apos;andamento nel tempo.
        </p>
      </div>
    );
  }

  const { data: allMeasurements } = await supabase
    .from("measurements")
    .select("*")
    .in("client_id", clientIds)
    .order("date", { ascending: true });

  const latestByClient = new Map<string, Measurement>();
  for (const m of allMeasurements ?? []) {
    latestByClient.set(m.client_id, m as Measurement);
  }

  const roster = clients.map((c) => {
    const latest = latestByClient.get(c.id) ?? null;
    const age = c.date_of_birth ? calculateAge(c.date_of_birth) : null;
    const gender = (c.gender as Gender | null) ?? null;
    const { averageScore } = synthesizeReport(computeFullReport(latest, gender, age));
    return { id: c.id, name: c.full_name, lastDate: latest?.date ?? null, averageScore };
  });

  return (
    <div>
      <div className="mb-5">
        <div className="text-[10.5px] font-semibold tracking-wide text-gold">{todayLabel}</div>
        <h1 className="mt-1 font-display text-[26px] font-bold leading-tight">
          Bentornato, <span className="text-teal">{firstName}</span>
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-faint">La tua giornata in sintesi.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <StatCard icon={Users} label="Clienti totali" value={clients.length} />
        <StatCard icon={UserCheck} label="Clienti attivi (30gg)" value={activeClientIds.size} />
        <StatCard icon={Bell} label="Check-in da rivedere" value={unseenCheckins?.length ?? 0} />
        <StatCard icon={Apple} label="Database alimenti" value={foodsCount ?? 0} />
        <StatCard icon={Utensils} label="Piani diete attivi" value={activeDietClientIds.size} />
        <StatCard icon={CalendarClock} label="Scadenze (7gg)" value={upcomingAppointments?.length ?? 0} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <SectionLabel>Da fare</SectionLabel>
        {notifications.length > 0 && (
          <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold-ink">
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-[12.5px] text-ink-faint">
          <ClipboardCheck size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          Niente in sospeso, tutto sotto controllo.
        </div>
      ) : (
        <div className="mb-6 space-y-2">
          {notifications.map((n) => (
            <Link
              key={`${n.type}-${n.id}`}
              href={`/trainer/${n.client_id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
            >
              <div className="flex items-start gap-2.5">
                {n.type === "checkin" && <Bell size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />}
                {n.type === "delivery" && <Truck size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal" />}
                {n.type === "supplement" && <Pill size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal" />}
                <div>
                  <div className="text-sm font-semibold">{nameById.get(n.client_id) ?? "Cliente"}</div>
                  {n.type === "checkin" && (
                    <div className="text-xs text-ink-faint">
                      Check settimana {formatWeekLabel(n.checkin.week_start)}
                      {n.checkin.weight_kg !== null && ` · peso ${n.checkin.weight_kg}kg`}
                      {n.checkin.workouts_count !== null && ` · ${n.checkin.workouts_count} allenamenti`}
                      {n.checkin.energy !== null && ` · energia ${n.checkin.energy}/10`}
                    </div>
                  )}
                  {n.type === "delivery" && (
                    <div className="text-xs text-ink-faint">
                      Richiesta servizio delivery a domicilio
                      {n.delivery.goal && ` · obiettivo ${DELIVERY_GOAL_LABELS[n.delivery.goal] ?? n.delivery.goal}`}
                    </div>
                  )}
                  {n.type === "supplement" && (
                    <div className="text-xs text-ink-faint">
                      Richiesta integratori (Mowe Nutrition)
                      {n.supplement.items && n.supplement.items.length > 0 && ` · ${n.supplement.items.length} prodotti`}
                    </div>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-ink-faint">{formatRelativeIt(n.created_at)}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <SectionLabel>Prossime scadenze</SectionLabel>
        <Link href="/trainer/calendario" className="ml-auto text-[11px] font-medium text-teal hover:underline">
          Vai al calendario
        </Link>
      </div>

      {!upcomingAppointments || upcomingAppointments.length === 0 ? (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-[12.5px] text-ink-faint">
          <CalendarClock size={15} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          Nessuna scadenza nei prossimi 7 giorni.
        </div>
      ) : (
        <div className="mb-6 space-y-2">
          {upcomingAppointments.map((a) => {
            const accent = appointmentTypeAccent(a.type);
            const overdue = a.date < todayIso;
            return (
              <Link
                key={a.id}
                href="/trainer/calendario"
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
              >
                <div className="flex items-start gap-2.5">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
                  <div>
                    <div className="text-sm font-semibold">{nameById.get(a.client_id) ?? "Cliente"}</div>
                    <div className="text-xs text-ink-faint">
                      {appointmentTypeLabel(a.type)}
                      {a.title && a.title !== appointmentTypeLabel(a.type) && ` · ${a.title}`}
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 text-[11px] font-medium ${overdue ? "text-bad" : "text-ink-faint"}`}>
                  {overdue ? "scaduta · " : ""}
                  {new Date(a.date + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <SectionLabel>I tuoi clienti</SectionLabel>
      <div className="mt-3 space-y-2">
        {roster.map((c) => (
          <Link
            key={c.id}
            href={`/trainer/${c.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
          >
            <div>
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-ink-faint">
                {c.lastDate ? `Ultima rilevazione ${formatDateIt(c.lastDate)}` : "Nessuna rilevazione ancora"}
              </div>
            </div>
            {c.averageScore !== null && (
              <span className={`flex items-baseline gap-0.5 font-display text-lg font-bold ${scoreColor(c.averageScore)}`}>
                {c.averageScore}
                <span className="text-xs font-medium text-ink-faint">/20</span>
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
