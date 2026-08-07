import type { Tables } from "@/lib/database.types";

export type Gender = "maschio" | "femmina";

export type Measurement = Tables<"measurements">;

export interface ScoreResult {
  /** 1-20, higher is better */
  score: number;
  strengths: string[];
  weaknesses: string[];
}

function clampRound(value: number, min = 1, max = 20) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Linear interpolation between banded points, e.g. `band(value, [[0,0],[60,6],[90,0]])`. */
function bandPoints(value: number, points: number[], thresholds: number[]) {
  // thresholds.length === points.length - 1, ascending
  for (let i = 0; i < thresholds.length; i++) {
    if (value < thresholds[i]) return points[i];
  }
  return points[points.length - 1];
}

export function calculateAge(dateOfBirth: string, atDate = new Date()): number {
  const dob = new Date(dateOfBirth + "T00:00:00");
  let age = atDate.getFullYear() - dob.getFullYear();
  const monthDiff = atDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < dob.getDate())) age--;
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calculateWaistHipRatio(waistCm: number, hipCm: number): number {
  return waistCm / hipCm;
}

/** Mifflin-St Jeor equation. */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "maschio" ? base + 5 : base - 161;
}

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentario: 1.2,
  leggero: 1.375,
  moderato: 1.55,
  intenso: 1.725,
  molto_intenso: 1.9,
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: "Sedentario (poco o nessun esercizio)",
  leggero: "Leggero (1-3 giorni/settimana)",
  moderato: "Moderato (3-5 giorni/settimana)",
  intenso: "Intenso (6-7 giorni/settimana)",
  molto_intenso: "Molto intenso (lavoro fisico + allenamento quotidiano)",
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2);
}

/** US Navy body-fat estimation method, used only when a direct measurement isn't available. */
export function estimateBodyFatPercent(
  gender: Gender,
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number
): number | null {
  if (gender === "maschio") {
    if (waistCm <= neckCm) return null;
    return (
      495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
    );
  }
  if (!hipCm || waistCm + hipCm <= neckCm) return null;
  return (
    495 /
      (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) -
    450
  );
}

/** Epley formula: estimates a 1-rep max from a submaximal set. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export interface HeartRateZone {
  zone: number;
  label: string;
  bpmMin: number;
  bpmMax: number;
}

/** Karvonen method: uses heart rate reserve (HRmax - HRrest), not just %HRmax. */
export function calculateHeartRateZones(age: number, restingHr: number): HeartRateZone[] {
  const hrMax = 220 - age;
  const hrr = hrMax - restingHr;
  const bounds = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const labels = [
    "Recupero attivo",
    "Fondo lungo / base aerobica",
    "Aerobico soglia",
    "Soglia anaerobica",
    "Massimale",
  ];
  return labels.map((label, i) => ({
    zone: i + 1,
    label,
    bpmMin: Math.round(hrr * bounds[i] + restingHr),
    bpmMax: Math.round(hrr * bounds[i + 1] + restingHr),
  }));
}

/** Cooper test (12 minutes) → estimated VO2max. */
export function vo2maxFromCooperTest(distanceMeters: number): number {
  return (distanceMeters - 504.9) / 44.73;
}

// ---------------------------------------------------------------------------
// Scoring. Every area is scored out of 20. Thresholds below are reasonable,
// general-population defaults (not personalized clinical ranges) meant as a
// starting point — adjust them here as needed.
// ---------------------------------------------------------------------------

function combineToTwenty(parts: { points: number; max: number }[]): number {
  const totalPoints = parts.reduce((s, p) => s + p.points, 0);
  const totalMax = parts.reduce((s, p) => s + p.max, 0);
  if (totalMax === 0) return 1;
  return clampRound((totalPoints / totalMax) * 20);
}

export function scoreCardiovascular(m: Measurement, age: number, gender: Gender): ScoreResult {
  const parts: { points: number; max: number }[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  let vo2max = m.vo2max ?? undefined;
  if (vo2max === undefined && m.cooper_test_meters) {
    vo2max = vo2maxFromCooperTest(m.cooper_test_meters);
  }
  if (vo2max !== undefined) {
    const thresholds =
      gender === "maschio" ? [30, 38, 45, 52] : [24, 31, 37, 44];
    const pts = bandPoints(vo2max, [0, 2, 4, 6, 8], thresholds);
    parts.push({ points: pts, max: 8 });
    if (pts >= 6) strengths.push(`VO2max nella media alta/eccellente (${vo2max.toFixed(1)} ml/kg/min)`);
    if (pts <= 2) weaknesses.push(`VO2max sotto la media (${vo2max.toFixed(1)} ml/kg/min)`);
  }

  if (m.resting_hr) {
    const pts = bandPoints(m.resting_hr, [6, 4.5, 3, 1.5, 0], [60, 70, 80, 90]);
    parts.push({ points: pts, max: 6 });
    if (pts >= 4.5) strengths.push(`Frequenza cardiaca a riposo ottima (${m.resting_hr} bpm)`);
    if (pts <= 1.5) weaknesses.push(`Frequenza cardiaca a riposo elevata (${m.resting_hr} bpm)`);
  }

  if (m.five_km_time_seconds) {
    const minutes = m.five_km_time_seconds / 60;
    const thresholds = gender === "maschio" ? [20, 25, 30, 35] : [25, 30, 35, 40];
    const pts = bandPoints(minutes, [6, 4.5, 3, 1.5, 0], thresholds);
    parts.push({ points: pts, max: 6 });
    if (pts >= 4.5) strengths.push("Buon passo sui 5km");
    if (pts <= 1.5) weaknesses.push("Passo sui 5km da migliorare");
  }

  if (parts.length === 0) return { score: 1, strengths: [], weaknesses: ["Dati insufficienti per calcolare il punteggio"] };
  return { score: combineToTwenty(parts), strengths, weaknesses };
}

export function scoreSleep(m: Measurement): ScoreResult {
  const parts: { points: number; max: number }[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (m.sleep_hours) {
    let pts: number;
    if (m.sleep_hours >= 7 && m.sleep_hours <= 9) pts = 7;
    else if ((m.sleep_hours >= 6 && m.sleep_hours < 7) || (m.sleep_hours > 9 && m.sleep_hours <= 10)) pts = 5;
    else if (m.sleep_hours >= 5 && m.sleep_hours < 6) pts = 2;
    else pts = 0;
    parts.push({ points: pts, max: 7 });
    if (pts === 7) strengths.push(`Ore di sonno nella finestra ideale (${m.sleep_hours}h)`);
    if (pts <= 2) weaknesses.push(`Ore di sonno fuori dal range consigliato (${m.sleep_hours}h)`);
  }

  if (m.sleep_quality) {
    const pts = (m.sleep_quality / 10) * 7;
    parts.push({ points: pts, max: 7 });
    if (m.sleep_quality >= 8) strengths.push(`Qualità del sonno percepita alta (${m.sleep_quality}/10)`);
    if (m.sleep_quality <= 4) weaknesses.push(`Qualità del sonno percepita bassa (${m.sleep_quality}/10)`);
  }

  if (m.hrv) {
    const pts = bandPoints(m.hrv, [0, 1.5, 3, 4.5, 6], [20, 35, 50, 65]);
    parts.push({ points: pts, max: 6 });
    if (pts >= 4.5) strengths.push(`HRV nella media alta (${m.hrv} ms)`);
    if (pts <= 1.5) weaknesses.push(`HRV bassa, possibile segnale di stress/recupero insufficiente (${m.hrv} ms)`);
  }

  if (parts.length === 0) return { score: 1, strengths: [], weaknesses: ["Dati insufficienti per calcolare il punteggio"] };
  return { score: combineToTwenty(parts), strengths, weaknesses };
}

export function scoreAnthropometry(
  m: Measurement,
  gender: Gender
): ScoreResult {
  const parts: { points: number; max: number }[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (m.weight_kg && m.height_cm) {
    const bmi = calculateBMI(m.weight_kg, m.height_cm);
    let pts: number;
    if (bmi >= 18.5 && bmi < 25) pts = 7;
    else if ((bmi >= 17 && bmi < 18.5) || (bmi >= 25 && bmi < 30)) pts = 4;
    else if ((bmi >= 16 && bmi < 17) || (bmi >= 30 && bmi < 35)) pts = 2;
    else pts = 0;
    parts.push({ points: pts, max: 7 });
    if (pts === 7) strengths.push(`BMI nel range normale (${bmi.toFixed(1)})`);
    if (pts <= 2) weaknesses.push(`BMI fuori dal range normale (${bmi.toFixed(1)})`);
  }

  if (m.waist_cm && m.hip_cm) {
    const whr = calculateWaistHipRatio(m.waist_cm, m.hip_cm);
    const goodMax = gender === "maschio" ? 0.9 : 0.8;
    const midMax = gender === "maschio" ? 0.95 : 0.85;
    let pts: number;
    if (whr < goodMax) pts = 7;
    else if (whr < midMax) pts = 4;
    else pts = 1;
    parts.push({ points: pts, max: 7 });
    if (pts === 7) strengths.push(`Rapporto vita/fianchi ottimo (${whr.toFixed(2)})`);
    if (pts === 1) weaknesses.push(`Rapporto vita/fianchi elevato (${whr.toFixed(2)})`);
  }

  let bodyFat = m.body_fat_percent ?? undefined;
  if (bodyFat === undefined && m.waist_cm && m.neck_cm && m.height_cm) {
    bodyFat = estimateBodyFatPercent(gender, m.waist_cm, m.neck_cm, m.height_cm, m.hip_cm ?? undefined) ?? undefined;
  }
  if (bodyFat !== undefined) {
    const thresholds = gender === "maschio" ? [14, 18, 25, 30] : [21, 25, 32, 38];
    const pts = bandPoints(bodyFat, [6, 4.5, 3, 1.5, 0], thresholds);
    parts.push({ points: pts, max: 6 });
    if (pts >= 4.5) strengths.push(`Percentuale di massa grassa in un buon range (${bodyFat.toFixed(1)}%)`);
    if (pts <= 1.5) weaknesses.push(`Percentuale di massa grassa elevata (${bodyFat.toFixed(1)}%)`);
  }

  if (parts.length === 0) return { score: 1, strengths: [], weaknesses: ["Dati insufficienti per calcolare il punteggio"] };
  return { score: combineToTwenty(parts), strengths, weaknesses };
}

function strengthRatioPoints(ratio: number, thresholds: number[]) {
  return bandPoints(ratio, [1, 2, 3, 4], thresholds);
}

export function scoreStrength(m: Measurement, gender: Gender): ScoreResult {
  const parts: { points: number; max: number }[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const bw = m.weight_kg;

  if (bw) {
    const lifts: { key: "squat_1rm" | "bench_1rm" | "deadlift_1rm"; label: string; thresholds: number[] }[] =
      gender === "maschio"
        ? [
            { key: "squat_1rm", label: "Squat", thresholds: [0.75, 1.25, 1.75] },
            { key: "bench_1rm", label: "Panca", thresholds: [0.5, 0.9, 1.25] },
            { key: "deadlift_1rm", label: "Stacco", thresholds: [1.0, 1.5, 2.0] },
          ]
        : [
            { key: "squat_1rm", label: "Squat", thresholds: [0.5, 1.0, 1.5] },
            { key: "bench_1rm", label: "Panca", thresholds: [0.35, 0.6, 0.9] },
            { key: "deadlift_1rm", label: "Stacco", thresholds: [0.75, 1.25, 1.75] },
          ];

    for (const lift of lifts) {
      const value = m[lift.key];
      if (!value) continue;
      const ratio = value / bw;
      const pts = strengthRatioPoints(ratio, lift.thresholds);
      parts.push({ points: pts, max: 4 });
      if (pts === 4) strengths.push(`${lift.label} a livello avanzato rispetto al peso corporeo`);
      if (pts === 1) weaknesses.push(`${lift.label} ha margine di crescita rispetto al peso corporeo`);
    }

    if (m.pullup_1rm !== null && m.pullup_1rm !== undefined) {
      let pts: number;
      if (m.pullup_1rm >= 15) pts = 4;
      else if (m.pullup_1rm > 0) pts = 3;
      else if (m.pullup_1rm === 0) pts = 2;
      else pts = 1;
      parts.push({ points: pts, max: 4 });
      if (pts >= 3) strengths.push("Buon massimale di trazioni");
      if (pts <= 1) weaknesses.push("Massimale di trazioni da sviluppare");
    }
  }

  if (m.workouts_per_week !== null && m.workouts_per_week !== undefined) {
    let pts: number;
    if (m.workouts_per_week >= 3 && m.workouts_per_week <= 5) pts = 4;
    else if (m.workouts_per_week === 2 || m.workouts_per_week === 6) pts = 3;
    else if (m.workouts_per_week === 1 || m.workouts_per_week >= 7) pts = 2;
    else pts = 0;
    parts.push({ points: pts, max: 4 });
    if (pts === 4) strengths.push(`Frequenza di allenamento ottimale (${m.workouts_per_week}/settimana)`);
    if (pts === 0) weaknesses.push("Frequenza di allenamento troppo bassa");
  }

  if (parts.length === 0) return { score: 1, strengths: [], weaknesses: ["Dati insufficienti per calcolare il punteggio"] };
  return { score: combineToTwenty(parts), strengths, weaknesses };
}

export function scoreNutrition(m: Measurement): ScoreResult {
  const parts: { points: number; max: number }[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (m.junk_food_weekly !== null && m.junk_food_weekly !== undefined) {
    const pts = bandPoints(m.junk_food_weekly, [3, 2, 1, 0], [2, 4, 7]);
    parts.push({ points: pts, max: 3 });
    if (pts === 3) strengths.push("Consumo di cibo spazzatura molto contenuto");
    if (pts === 0) weaknesses.push(`Consumo frequente di cibo spazzatura (${m.junk_food_weekly}/settimana)`);
  }

  if (m.fruit_veg_daily !== null && m.fruit_veg_daily !== undefined) {
    const pts = bandPoints(m.fruit_veg_daily, [0, 1.5, 3, 4], [1, 3, 5]);
    parts.push({ points: pts, max: 4 });
    if (pts === 4) strengths.push(`Ottimo consumo di frutta e verdura (${m.fruit_veg_daily} porzioni/giorno)`);
    if (pts === 0) weaknesses.push("Consumo di frutta e verdura insufficiente");
  }

  if (m.alcohol_weekly !== null && m.alcohol_weekly !== undefined) {
    const pts = bandPoints(m.alcohol_weekly, [3, 2, 1, 0], [2, 5, 10]);
    parts.push({ points: pts, max: 3 });
    if (pts === 3) strengths.push("Consumo di alcol molto basso");
    if (pts === 0) weaknesses.push(`Consumo di alcol elevato (${m.alcohol_weekly} unità/settimana)`);
  }

  if (m.red_meat_weekly !== null && m.red_meat_weekly !== undefined) {
    const pts = m.red_meat_weekly <= 3 ? 2 : m.red_meat_weekly <= 5 ? 1 : 0;
    parts.push({ points: pts, max: 2 });
    if (pts === 0) weaknesses.push(`Consumo di carne rossa elevato (${m.red_meat_weekly}/settimana)`);
  }

  if (m.fish_weekly !== null && m.fish_weekly !== undefined) {
    const pts = m.fish_weekly >= 2 ? 3 : m.fish_weekly === 1 ? 1.5 : 0;
    parts.push({ points: pts, max: 3 });
    if (pts === 3) strengths.push("Buon consumo di pesce");
    if (pts === 0) weaknesses.push("Consumo di pesce basso");
  }

  if (m.protein_meals_daily !== null && m.protein_meals_daily !== undefined) {
    const pts = m.protein_meals_daily >= 3 ? 3 : m.protein_meals_daily >= 2 ? 2 : m.protein_meals_daily >= 1 ? 1 : 0;
    parts.push({ points: pts, max: 3 });
    if (pts === 3) strengths.push("Buona distribuzione di pasti proteici");
    if (pts === 0) weaknesses.push("Pochi pasti con una fonte proteica adeguata");
  }

  if (m.water_daily_liters !== null && m.water_daily_liters !== undefined) {
    const pts = m.water_daily_liters >= 2 ? 2 : m.water_daily_liters >= 1.2 ? 1 : 0;
    parts.push({ points: pts, max: 2 });
    if (pts === 2) strengths.push("Buona idratazione");
    if (pts === 0) weaknesses.push(`Idratazione insufficiente (${m.water_daily_liters} L/giorno)`);
  }

  if (parts.length === 0) return { score: 1, strengths: [], weaknesses: ["Dati insufficienti per calcolare il punteggio"] };
  return { score: combineToTwenty(parts), strengths, weaknesses };
}
