import { BLOOD_MARKERS } from "@/lib/blood-markers";
import type { Gender } from "@/lib/health-score";

export type MarkerStatus = "low" | "high" | "normal";

export interface MarkerReading {
  key: string;
  label: string;
  unit: string;
  value: number;
  min: number | null;
  max: number | null;
  status: MarkerStatus;
  advice?: string;
}

export function analyzeBloodTest(
  values: { marker_key: string; value: number }[],
  gender: Gender | null
): MarkerReading[] {
  const readings: MarkerReading[] = [];

  for (const v of values) {
    const marker = BLOOD_MARKERS.find((m) => m.key === v.marker_key);
    if (!marker) continue;

    const { min, max } = marker.range(gender);
    let status: MarkerStatus = "normal";
    let advice: string | undefined;

    if (min !== null && v.value < min) {
      status = "low";
      advice = marker.adviceLow;
    } else if (max !== null && v.value > max) {
      status = "high";
      advice = marker.adviceHigh;
    }

    readings.push({
      key: marker.key,
      label: marker.label,
      unit: marker.unit,
      value: v.value,
      min,
      max,
      status,
      advice,
    });
  }

  return readings;
}
