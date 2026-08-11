import Link from "next/link";
import { HeartPulse, Dumbbell, ChefHat, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeFullReport } from "@/lib/health-report";
import { SectionIntro } from "@/components/ui";

const AREA_LABELS = ["Cardiovascolare", "Sonno", "Antropometria", "Forza", "Alimentare"];

function radarPreviewPoints(scores: number[]) {
  const cx = 60,
    cy = 60,
    R = 46;
  return scores
    .map((v, i) => {
      const a = -Math.PI / 2 + i * ((2 * Math.PI) / scores.length);
      const r = R * (Math.max(0, Math.min(20, v)) / 20);
      return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
    })
    .join(" ");
}

export default async function ClienteHub() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, date_of_birth, gender")
    .eq("profile_id", session!.user.id)
    .single();

  let scores: number[] | null = null;
  if (client) {
    const { data: measurements } = await supabase
      .from("measurements")
      .select("*")
      .eq("client_id", client.id)
      .order("date", { ascending: true });
    const entries = measurements ?? [];
    const latestMeasurement = entries.length ? entries[entries.length - 1] : null;
    if (latestMeasurement) {
      const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
      const gender = (client.gender as Gender | null) ?? null;
      const areaScores = computeFullReport(latestMeasurement, gender, age)
        .map((a) => a.result?.score)
        .filter((s): s is number => s !== null && s !== undefined);
      if (areaScores.length === 5) scores = areaScores;
    }
  }

  return (
    <div>
      <SectionIntro title="La tua area" subtitle="Scegli cosa vuoi fare." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/cliente/valutazione"
          className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-teal"
        >
          <div className="mb-3 flex items-center gap-2">
            <HeartPulse size={17} strokeWidth={2.2} className="text-teal" />
            <div className="font-display text-base font-bold">Valutazione</div>
            <ChevronRight size={15} className="ml-auto text-ink-faint transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mb-3 text-[12.5px] text-ink-faint">
            I tuoi dati, il punteggio salute e il check-in settimanale.
          </p>
          {scores ? (
            <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28">
              {[0.5, 1].map((f, i) => (
                <polygon
                  key={i}
                  points={radarPreviewPoints(AREA_LABELS.map(() => 20 * f))}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="1"
                />
              ))}
              <polygon
                points={radarPreviewPoints(scores)}
                fill="var(--brand)"
                fillOpacity="0.18"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="flex h-28 items-center justify-center text-center text-[11px] text-ink-faint">
              Il poligono apparirà qui dopo la prima rilevazione.
            </div>
          )}
        </Link>

        <Link
          href="/cliente/allenamenti"
          className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-teal"
        >
          <div className="mb-3 flex items-center gap-2">
            <Dumbbell size={17} strokeWidth={2.2} className="text-teal" />
            <div className="font-display text-base font-bold">Allenamenti</div>
            <ChevronRight size={15} className="ml-auto text-ink-faint transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[12.5px] text-ink-faint">Le schede di allenamento in base agli attrezzi che hai.</p>
        </Link>

        <Link
          href="/cliente/nutrizione"
          className="group rounded-card border border-line bg-surface p-5 transition-colors hover:border-teal"
        >
          <div className="mb-3 flex items-center gap-2">
            <ChefHat size={17} strokeWidth={2.2} className="text-teal" />
            <div className="font-display text-base font-bold">Nutrizione</div>
            <ChevronRight size={15} className="ml-auto text-ink-faint transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[12.5px] text-ink-faint">Ricette pronte e calcolo rapido delle calorie per la cena fuori.</p>
        </Link>
      </div>
    </div>
  );
}
