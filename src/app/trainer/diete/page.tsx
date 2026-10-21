import Link from "next/link";
import { Utensils } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { PHASE_LABELS, PHASE_ACCENT, type DietPhase } from "@/lib/diet-calc";

export default async function DietePage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("trainer_id", session!.user.id)
    .order("full_name");

  const clientIds = (clients ?? []).map((c) => c.id);

  const { data: activePlans } = clientIds.length
    ? await supabase
        .from("diet_plans")
        .select("client_id, name, phase, target_kcal")
        .in("client_id", clientIds)
        .eq("active", true)
    : { data: [] };

  const planByClient = new Map((activePlans ?? []).map((p) => [p.client_id, p]));

  return (
    <div>
      <SectionIntro
        title="Diete"
        subtitle="Panoramica dei piani alimentari: apri un cliente per creare o modificare il suo piano."
      />

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <Utensils size={20} strokeWidth={1.8} className="text-ink-faint" />
          <p className="text-[12.5px] text-ink-faint">Nessun cliente ancora.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => {
            const plan = planByClient.get(c.id);
            const phase = plan?.phase as DietPhase | null | undefined;
            const accent = phase ? PHASE_ACCENT[phase] : null;
            return (
              <Link
                key={c.id}
                href={`/trainer/${c.id}/diete`}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-teal"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{c.full_name}</div>
                  {plan ? (
                    <div className="mt-0.5 truncate text-xs text-ink-faint">
                      {plan.name}
                      {plan.target_kcal ? ` · ${Math.round(plan.target_kcal)} kcal` : ""}
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-ink-faint">Nessun piano attivo</div>
                  )}
                </div>
                {plan ? (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${accent?.bg ?? "bg-cream"} ${accent?.text ?? "text-ink-soft"}`}
                  >
                    {phase ? PHASE_LABELS[phase] : "Attivo"}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[10.5px] font-medium text-ink-faint">
                    Da creare
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
