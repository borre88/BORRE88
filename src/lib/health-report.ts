import {
  scoreCardiovascular,
  scoreSleep,
  scoreAnthropometry,
  scoreStrength,
  scoreNutrition,
  type Gender,
  type Measurement,
  type ScoreResult,
} from "@/lib/health-score";

export interface AreaScore {
  key: string;
  label: string;
  result: ScoreResult | null;
  /** Why `result` is null, when it is. */
  missingReason?: string;
}

export function computeFullReport(
  measurement: Measurement | null,
  gender: Gender | null,
  age: number | null
): AreaScore[] {
  if (!measurement) {
    return [
      { key: "cardio", label: "Cardiovascolare", result: null, missingReason: "Nessuna rilevazione" },
      { key: "sonno", label: "Sonno", result: null, missingReason: "Nessuna rilevazione" },
      { key: "antropometria", label: "Antropometria", result: null, missingReason: "Nessuna rilevazione" },
      { key: "forza", label: "Forza", result: null, missingReason: "Nessuna rilevazione" },
      { key: "alimentare", label: "Alimentare", result: null, missingReason: "Nessuna rilevazione" },
    ];
  }

  return [
    {
      key: "cardio",
      label: "Cardiovascolare",
      result: gender && age !== null ? scoreCardiovascular(measurement, age, gender) : null,
      missingReason: gender && age !== null ? undefined : "Servono sesso e data di nascita",
    },
    { key: "sonno", label: "Sonno", result: scoreSleep(measurement) },
    {
      key: "antropometria",
      label: "Antropometria",
      result: gender ? scoreAnthropometry(measurement, gender) : null,
      missingReason: gender ? undefined : "Serve il sesso",
    },
    {
      key: "forza",
      label: "Forza",
      result: gender ? scoreStrength(measurement, gender) : null,
      missingReason: gender ? undefined : "Serve il sesso",
    },
    { key: "alimentare", label: "Alimentare", result: scoreNutrition(measurement) },
  ];
}

export interface ReportSynthesis {
  strongAreas: string[];
  weakAreas: string[];
  averageScore: number | null;
}

export function synthesizeReport(areas: AreaScore[]): ReportSynthesis {
  const scored = areas.filter((a): a is AreaScore & { result: ScoreResult } => a.result !== null);
  const strongAreas = scored.filter((a) => a.result.score >= 15).map((a) => a.label);
  const weakAreas = scored.filter((a) => a.result.score < 10).map((a) => a.label);
  const averageScore = scored.length
    ? Math.round((scored.reduce((sum, a) => sum + a.result.score, 0) / scored.length) * 10) / 10
    : null;
  return { strongAreas, weakAreas, averageScore };
}
