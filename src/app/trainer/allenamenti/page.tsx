import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { toISODate } from "@/lib/dates";

export default async function AllenamentiPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("trainer_id", session!.user.id)
    .order("full_name");

  const clientIds = (clients ?? []).map((c) => c.id);
  const todayIso = toISODate(new Date());

  const { data: assignments } = clientIds.length
    ? await supabase
        .from("workout_assignments")
        .select("client_id, date, name")
        .in("client_id", clientIds)
        .order("date")
    : { data: [] };

  const summaryByClient = new Map<string, { total: number; next: { date: string; name: string } | null }>();
  for (const a of assignments ?? []) {
    const entry = summaryByClient.get(a.client_id) ?? { total: 0, next: null };
    entry.total += 1;
    if (a.date >= todayIso && (!entry.next || a.date < entry.next.date)) {
      entry.next = { date: a.date, name: a.name };
    }
    summaryByClient.set(a.client_id, entry);
  }

  return (
    <div>
      <SectionIntro
        title="Allenamenti"
        subtitle="Panoramica dei clienti: apri un cliente per gestire catalogo, calendario e libreria assegnata."
      />

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <Dumbbell size={20} strokeWidth={1.8} className="text-ink-faint" />
          <p className="text-[12.5px] text-ink-faint">Nessun cliente ancora.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => {
            const summary = summaryByClient.get(c.id);
            return (
              <Link
                key={c.id}
                href={`/trainer/${c.id}/allenamenti`}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{c.full_name}</div>
                  <div className="mt-0.5 truncate text-xs text-ink-faint">
                    {summary?.next
                      ? `Prossimo: ${summary.next.name} · ${new Date(summary.next.date + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}`
                      : "Nessun allenamento in programma"}
                  </div>
                </div>
                {summary && summary.total > 0 && (
                  <span className="shrink-0 rounded-full bg-teal-soft px-2.5 py-1 text-[10.5px] font-semibold text-teal">
                    {summary.total} in calendario
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
