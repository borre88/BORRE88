export type DietPhase = "perdita_peso" | "massa_muscolare" | "ricomposizione" | "mantenimento";
export type DietSpeed = "prudente" | "standard" | "aggressivo";
export type EnergyBalance = "ipocalorica" | "normocalorica" | "ipercalorica";

export const PHASE_LABELS: Record<DietPhase, string> = {
  perdita_peso: "Perdita peso",
  massa_muscolare: "Massa muscolare",
  ricomposizione: "Ricomposizione",
  mantenimento: "Mantenimento",
};

export const SPEED_LABELS: Record<DietSpeed, string> = {
  prudente: "Prudente",
  standard: "Standard",
  aggressivo: "Aggressivo",
};

/** Variazione % rispetto al TDEE per fase e velocità (negativa = deficit, positiva = surplus). */
export const PHASE_SPEED_VARIATION: Record<DietPhase, Record<DietSpeed, number>> = {
  perdita_peso: { prudente: -10, standard: -15, aggressivo: -20 },
  massa_muscolare: { prudente: 5, standard: 10, aggressivo: 15 },
  ricomposizione: { prudente: -5, standard: -8, aggressivo: -12 },
  mantenimento: { prudente: 0, standard: 0, aggressivo: 0 },
};

/** Grammi di proteine per kg di peso corporeo, indicativi per fase. */
const PROTEIN_G_PER_KG: Record<DietPhase, number> = {
  perdita_peso: 2.2,
  massa_muscolare: 1.8,
  ricomposizione: 2.0,
  mantenimento: 1.6,
};

/** Stima attesa di variazione di peso settimanale (kg), solo indicativa per la UI. */
const WEEKLY_WEIGHT_CHANGE_PERCENT: Record<DietSpeed, number> = {
  prudente: 0.5,
  standard: 0.75,
  aggressivo: 1.0,
};

export function calculateTargetKcal(tdee: number, variationPercent: number): number {
  return tdee * (1 + variationPercent / 100);
}

export function classifyEnergyBalance(variationPercent: number): EnergyBalance {
  if (variationPercent < -2) return "ipocalorica";
  if (variationPercent > 2) return "ipercalorica";
  return "normocalorica";
}

export interface MacroSplit {
  proteinG: number;
  fatG: number;
  carbsG: number;
}

/**
 * Ripartizione macro di base: proteine per kg peso (in base alla fase), grassi al 25% delle kcal,
 * carboidrati sul resto. Pensata come punto di partenza da aggiustare manualmente nell'editor.
 */
export function suggestMacroSplit(targetKcal: number, weightKg: number, phase: DietPhase | null): MacroSplit {
  const proteinPerKg = phase ? PROTEIN_G_PER_KG[phase] : 1.8;
  const proteinG = Math.round(proteinPerKg * weightKg);
  const fatG = Math.round((targetKcal * 0.25) / 9);
  const remainingKcal = Math.max(0, targetKcal - proteinG * 4 - fatG * 9);
  const carbsG = Math.round(remainingKcal / 4);
  return { proteinG, fatG, carbsG };
}

export function macroKcal(macro: MacroSplit): number {
  return macro.proteinG * 4 + macro.carbsG * 4 + macro.fatG * 9;
}

export interface WeightGoalEstimate {
  weeklyChangeKg: number;
  weeks: number;
  targetDate: Date;
}

/** Stima indicativa di quante settimane servono per raggiungere un peso obiettivo. */
export function estimateWeightGoal(
  currentWeightKg: number,
  targetWeightKg: number,
  speed: DietSpeed,
  fromDate = new Date()
): WeightGoalEstimate {
  const deltaKg = Math.abs(targetWeightKg - currentWeightKg);
  const weeklyChangeKg = (currentWeightKg * WEEKLY_WEIGHT_CHANGE_PERCENT[speed]) / 100;
  const weeks = weeklyChangeKg > 0 ? Math.max(1, Math.round(deltaKg / weeklyChangeKg)) : 0;
  const targetDate = new Date(fromDate);
  targetDate.setDate(targetDate.getDate() + weeks * 7);
  return { weeklyChangeKg, weeks, targetDate };
}

export const FOOD_CATEGORY_LABELS: Record<string, string> = {
  cereali: "Cereali e derivati",
  proteine_animali: "Proteine animali",
  proteine_vegetali: "Proteine vegetali e legumi",
  latticini: "Latticini e formaggi",
  grassi: "Grassi e frutta secca",
  verdura: "Verdura",
  frutta: "Frutta",
  bevande: "Bevande",
  dolci_snack: "Dolci e snack",
  condimenti: "Condimenti e spezie",
  altro: "Altro",
};

export const WEEKDAY_LABELS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
export const WEEKDAY_LABELS_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export const MEAL_TYPES = [
  { key: "colazione", label: "Colazione" },
  { key: "spuntino_mattina", label: "Spuntino Mattina" },
  { key: "pranzo", label: "Pranzo" },
  { key: "spuntino_pomeriggio", label: "Spuntino Pomeriggio" },
  { key: "cena", label: "Cena" },
  { key: "spuntino_sera", label: "Spuntino Sera" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["key"];

export const MEAL_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  MEAL_TYPES.map((m) => [m.key, m.label])
);

export interface FoodMacros {
  kcal_100g: number;
  protein_100g: number;
  carbs_100g: number;
  fat_100g: number;
  fiber_100g: number;
}

export function scaleFoodToQuantity(food: FoodMacros, quantityG: number) {
  const factor = quantityG / 100;
  return {
    kcal: food.kcal_100g * factor,
    protein: food.protein_100g * factor,
    carbs: food.carbs_100g * factor,
    fat: food.fat_100g * factor,
    fiber: food.fiber_100g * factor,
  };
}
