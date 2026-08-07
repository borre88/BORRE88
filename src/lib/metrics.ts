export type MetricKey =
  // Cardiovascolare
  | "vo2max"
  | "resting_hr"
  | "five_km_time_seconds"
  | "cooper_test_meters"
  // Sonno
  | "hrv"
  | "sleep_hours"
  | "sleep_quality"
  // Antropometria
  | "weight_kg"
  | "height_cm"
  | "waist_cm"
  | "hip_cm"
  | "neck_cm"
  | "body_fat_percent"
  // Forza
  | "workouts_per_week"
  | "squat_1rm"
  | "bench_1rm"
  | "deadlift_1rm"
  | "pullup_1rm"
  // Alimentare
  | "junk_food_weekly"
  | "fruit_veg_daily"
  | "alcohol_weekly"
  | "red_meat_weekly"
  | "fish_weekly"
  | "protein_meals_daily"
  | "water_daily_liters";

export interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  higherIsBetter: boolean | null;
  step: number;
}

export interface MetricGroup {
  key: string;
  label: string;
  description: string;
  metrics: MetricDef[];
}

export const METRIC_GROUPS: MetricGroup[] = [
  {
    key: "cardio",
    label: "Salute cardiovascolare",
    description: "VO2max, capacità aerobica e frequenza cardiaca.",
    metrics: [
      { key: "vo2max", label: "VO2max", unit: "ml/kg/min", higherIsBetter: true, step: 0.1 },
      { key: "resting_hr", label: "FC a riposo", unit: "bpm", higherIsBetter: false, step: 1 },
      { key: "five_km_time_seconds", label: "Tempo sui 5km", unit: "sec", higherIsBetter: false, step: 1 },
      { key: "cooper_test_meters", label: "Test di Cooper (12 min)", unit: "m", higherIsBetter: true, step: 10 },
    ],
  },
  {
    key: "sonno",
    label: "Salute del sonno",
    description: "Recupero notturno e variabilità cardiaca.",
    metrics: [
      { key: "hrv", label: "HRV", unit: "ms", higherIsBetter: true, step: 1 },
      { key: "sleep_hours", label: "Ore di sonno", unit: "h", higherIsBetter: true, step: 0.1 },
      { key: "sleep_quality", label: "Qualità del sonno", unit: "/10", higherIsBetter: true, step: 1 },
    ],
  },
  {
    key: "antropometria",
    label: "Misure antropometriche",
    description: "Peso, altezza, circonferenze e composizione corporea.",
    metrics: [
      { key: "weight_kg", label: "Peso", unit: "kg", higherIsBetter: null, step: 0.1 },
      { key: "height_cm", label: "Altezza", unit: "cm", higherIsBetter: null, step: 0.5 },
      { key: "waist_cm", label: "Vita", unit: "cm", higherIsBetter: null, step: 0.5 },
      { key: "hip_cm", label: "Fianchi", unit: "cm", higherIsBetter: null, step: 0.5 },
      { key: "neck_cm", label: "Collo", unit: "cm", higherIsBetter: null, step: 0.5 },
      { key: "body_fat_percent", label: "Massa grassa", unit: "%", higherIsBetter: false, step: 0.1 },
    ],
  },
  {
    key: "forza",
    label: "Forza corporea",
    description: "Massimali e frequenza di allenamento.",
    metrics: [
      { key: "workouts_per_week", label: "Allenamenti/settimana", unit: "", higherIsBetter: true, step: 1 },
      { key: "squat_1rm", label: "Squat 1RM", unit: "kg", higherIsBetter: true, step: 1 },
      { key: "bench_1rm", label: "Panca 1RM", unit: "kg", higherIsBetter: true, step: 1 },
      { key: "deadlift_1rm", label: "Stacco 1RM", unit: "kg", higherIsBetter: true, step: 1 },
      { key: "pullup_1rm", label: "Trazioni 1RM (kg aggiunti)", unit: "kg", higherIsBetter: true, step: 1 },
    ],
  },
  {
    key: "alimentare",
    label: "Salute alimentare",
    description: "Abitudini alimentari e idratazione.",
    metrics: [
      { key: "junk_food_weekly", label: "Cibo spazzatura", unit: "volte/sett.", higherIsBetter: false, step: 1 },
      { key: "fruit_veg_daily", label: "Frutta e verdura", unit: "porzioni/giorno", higherIsBetter: true, step: 1 },
      { key: "alcohol_weekly", label: "Alcol", unit: "unità/sett.", higherIsBetter: false, step: 1 },
      { key: "red_meat_weekly", label: "Carne rossa", unit: "volte/sett.", higherIsBetter: false, step: 1 },
      { key: "fish_weekly", label: "Pesce", unit: "volte/sett.", higherIsBetter: true, step: 1 },
      { key: "protein_meals_daily", label: "Pasti proteici", unit: "al giorno", higherIsBetter: true, step: 1 },
      { key: "water_daily_liters", label: "Acqua", unit: "L/giorno", higherIsBetter: true, step: 0.1 },
    ],
  },
];

export const ALL_METRICS: MetricDef[] = METRIC_GROUPS.flatMap((g) => g.metrics);

export type MeasurementLike = {
  date: string;
} & { [K in MetricKey]: number | null };

export interface LatestMetric {
  value: number;
  prevValue: number | null;
  date: string;
}

/** `entries` must already be sorted by date ascending. */
export function computeLatestByMetric(
  entries: MeasurementLike[]
): Record<MetricKey, LatestMetric | null> {
  const out = {} as Record<MetricKey, LatestMetric | null>;
  for (const m of ALL_METRICS) {
    const withValue = entries.filter((e) => e[m.key] !== null && e[m.key] !== undefined);
    if (!withValue.length) {
      out[m.key] = null;
      continue;
    }
    const last = withValue[withValue.length - 1];
    const prev = withValue.length > 1 ? withValue[withValue.length - 2] : null;
    out[m.key] = {
      value: Number(last[m.key]),
      prevValue: prev ? Number(prev[m.key]) : null,
      date: last.date,
    };
  }
  return out;
}

export function formatDateIt(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

export function formatSecondsAsClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
