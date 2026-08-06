export type MetricKey =
  | "sleep_hours"
  | "resting_hr"
  | "vo2max"
  | "squat_1rm"
  | "bench_1rm"
  | "deadlift_1rm"
  | "weight_kg";

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
  metrics: MetricDef[];
}

export const METRIC_GROUPS: MetricGroup[] = [
  {
    key: "recupero",
    label: "Recupero",
    metrics: [
      { key: "sleep_hours", label: "Sonno", unit: "h", higherIsBetter: true, step: 0.1 },
      { key: "resting_hr", label: "FC a riposo", unit: "bpm", higherIsBetter: false, step: 1 },
    ],
  },
  {
    key: "performance",
    label: "Performance",
    metrics: [
      { key: "vo2max", label: "VO2max", unit: "ml/kg/min", higherIsBetter: true, step: 0.1 },
      { key: "squat_1rm", label: "Squat 1RM", unit: "kg", higherIsBetter: true, step: 1 },
      { key: "bench_1rm", label: "Panca 1RM", unit: "kg", higherIsBetter: true, step: 1 },
      { key: "deadlift_1rm", label: "Stacco 1RM", unit: "kg", higherIsBetter: true, step: 1 },
    ],
  },
  {
    key: "corpo",
    label: "Corpo",
    metrics: [{ key: "weight_kg", label: "Peso", unit: "kg", higherIsBetter: null, step: 0.1 }],
  },
];

export const ALL_METRICS: MetricDef[] = METRIC_GROUPS.flatMap((g) => g.metrics);

export interface MeasurementLike {
  date: string;
  sleep_hours: number | null;
  resting_hr: number | null;
  vo2max: number | null;
  squat_1rm: number | null;
  bench_1rm: number | null;
  deadlift_1rm: number | null;
  weight_kg: number | null;
}

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
