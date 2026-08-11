import { HeartPulse, Dumbbell, ChefHat } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateAge, type Gender } from "@/lib/health-score";
import { computeFullReport, synthesizeReport } from "@/lib/health-report";
import { SectionIntro } from "@/components/ui";
import { HubCard } from "@/components/hub-card";

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
  let averageScore: number | null = null;
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
      const areas = computeFullReport(latestMeasurement, gender, age);
      const areaScores = areas.map((a) => a.result?.score).filter((s): s is number => s !== null && s !== undefined);
      if (areaScores.length === 5) scores = areaScores;
      averageScore = synthesizeReport(areas).averageScore;
    }
  }

  const [{ count: workoutsCount }, { count: recipesCount }] = await Promise.all([
    supabase.from("workouts").select("id", { count: "exact", head: true }),
    supabase.from("recipes").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <SectionIntro title="La tua area" subtitle="Scegli cosa vuoi fare." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HubCard
          href="/cliente/valutazione"
          icon={<HeartPulse size={17} strokeWidth={2.2} />}
          title="Valutazione"
          subtitle="I tuoi dati, il punteggio salute e il check-in settimanale."
          stat={averageScore !== null ? `Punteggio medio ${averageScore}/20` : undefined}
          delay={0}
        >
          {scores ? (
            <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28 transition-transform duration-300 group-hover:scale-105">
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
        </HubCard>

        <HubCard
          href="/cliente/allenamenti"
          icon={<Dumbbell size={17} strokeWidth={2.2} />}
          title="Allenamenti"
          subtitle="Le schede di allenamento in base agli attrezzi che hai."
          stat={
            workoutsCount
              ? workoutsCount === 1
                ? "1 scheda disponibile"
                : `${workoutsCount} schede disponibili`
              : undefined
          }
          delay={0.08}
        />

        <HubCard
          href="/cliente/nutrizione"
          icon={<ChefHat size={17} strokeWidth={2.2} />}
          title="Nutrizione"
          subtitle="Ricette pronte e calcolo rapido delle calorie per la cena fuori."
          stat={
            recipesCount
              ? recipesCount === 1
                ? "1 ricetta pronta"
                : `${recipesCount} ricette pronte`
              : undefined
          }
          delay={0.16}
        />
      </div>
    </div>
  );
}
