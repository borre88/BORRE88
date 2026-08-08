import {
  Moon,
  HeartPulse,
  Activity,
  Dumbbell,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Timer,
  Route,
  Waves,
  Sparkles,
  Ruler,
  PieChart,
  CalendarCheck,
  Pizza,
  Apple,
  Wine,
  Beef,
  Fish,
  Egg,
  Droplet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ALL_METRICS, type LatestMetric, type MetricDef, type MetricKey } from "@/lib/metrics";

const ICONS: Record<MetricKey, LucideIcon> = {
  vo2max: Activity,
  resting_hr: HeartPulse,
  five_km_time_minutes: Timer,
  cooper_test_meters: Route,
  hrv: Waves,
  sleep_hours: Moon,
  sleep_quality: Sparkles,
  weight_kg: Scale,
  height_cm: Ruler,
  waist_cm: Ruler,
  hip_cm: Ruler,
  neck_cm: Ruler,
  body_fat_percent: PieChart,
  workouts_per_week: CalendarCheck,
  squat_1rm: Dumbbell,
  bench_1rm: Dumbbell,
  deadlift_1rm: Dumbbell,
  pullup_max_reps: Dumbbell,
  junk_food_weekly: Pizza,
  fruit_veg_daily: Apple,
  alcohol_weekly: Wine,
  red_meat_weekly: Beef,
  fish_weekly: Fish,
  protein_meals_daily: Egg,
  water_daily_liters: Droplet,
};

export function SnapshotStrip({
  latest,
  metrics = ALL_METRICS,
}: {
  latest: Record<MetricKey, LatestMetric | null>;
  metrics?: MetricDef[];
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((m, i) => {
        const data = latest[m.key];
        const Icon = ICONS[m.key];
        let delta: number | null = null;
        let deltaDir: "good" | "bad" | "neutral" | "flat" = "flat";
        if (data && data.prevValue !== null) {
          delta = data.value - data.prevValue;
          if (Math.abs(delta) > 0.001) {
            const rising = delta > 0;
            deltaDir = m.higherIsBetter === null ? "neutral" : rising === m.higherIsBetter ? "good" : "bad";
          }
        }
        return (
          <div
            key={m.key}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            className="fade-in-up rounded-lg border border-line bg-surface px-3.5 py-3 transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Icon size={14} strokeWidth={2} className="text-teal" />
              <span className="text-[11px] font-medium text-ink-soft">{m.label}</span>
            </div>
            {data ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-medium">{data.value}</span>
                  <span className="text-[10.5px] text-ink-faint">{m.unit}</span>
                </div>
                {delta !== null && Math.abs(delta) > 0.001 ? (
                  <div
                    className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
                      deltaDir === "good" ? "text-good" : deltaDir === "bad" ? "text-bad" : "text-ink-soft"
                    }`}
                  >
                    {delta > 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                    {delta > 0 ? "+" : ""}
                    {Math.round(delta * 100) / 100} {m.unit}
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-faint">
                    <Minus size={12} strokeWidth={2.5} /> stabile
                  </div>
                )}
              </>
            ) : (
              <div className="mt-0.5 text-[11.5px] text-ink-faint">— nessun dato</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
