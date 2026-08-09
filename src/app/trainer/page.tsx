import Link from "next/link";
import { Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeIt, formatWeekLabel } from "@/lib/dates";
import { formatDateIt } from "@/lib/metrics";
import { calculateAge, type Gender, type Measurement } from "@/lib/health-score";
import { computeFullReport, synthesizeReport } from "@/lib/health-report";
import { SectionLabel } from "@/components/ui/SectionLabel";

function scoreColor(score: number) {
  if (score >= 15) return "text-good";
  if (score >= 10) return "text-gold";
  return "text-bad";
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

  const { data: unseen } = clientIds.length
    ? await supabase
        .from("weekly_checkins")
        .select("*")
        .in("client_id", clientIds)
        .is("viewed_by_trainer_at", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  const notifications = unseen ?? [];

  if (notifications.length > 0) {
    return (
      <div>
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-gold bg-gold-soft px-4 py-3">
          <Bell size={16} strokeWidth={2.2} className="shrink-0 text-gold" />
          <p className="text-[13px] font-medium text-ink">
            Hai {notifications.length} {notifications.length === 1 ? "nuova rilevazione" : "nuove rilevazioni"} dei
            tuoi clienti inserit{notifications.length === 1 ? "a" : "e"}, controlla.
          </p>
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/trainer/${n.client_id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
            >
              <div>
                <div className="text-sm font-semibold">{nameById.get(n.client_id) ?? "Cliente"}</div>
                <div className="text-xs text-ink-faint">
                  Check-in settimana {formatWeekLabel(n.week_start)}
                  {n.weight_kg !== null && ` · peso ${n.weight_kg}kg`}
                  {n.workouts_count !== null && ` · ${n.workouts_count} allenamenti`}
                  {n.energy !== null && ` · energia ${n.energy}/10`}
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-ink-faint">{formatRelativeIt(n.created_at)}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

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
