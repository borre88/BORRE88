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

interface AccentClasses {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

/** Colori per fase obiettivo, sui toni del brand: oro per il deficit, verde per il surplus, teal per il resto. */
export const PHASE_ACCENT: Record<DietPhase, AccentClasses> = {
  perdita_peso: { bg: "bg-gold-soft", border: "border-gold", text: "text-gold-ink", dot: "bg-gold" },
  massa_muscolare: { bg: "bg-good/10", border: "border-good/40", text: "text-good", dot: "bg-good" },
  ricomposizione: { bg: "bg-teal-soft", border: "border-teal-soft-line", text: "text-teal", dot: "bg-teal" },
  mantenimento: { bg: "bg-cream", border: "border-line", text: "text-ink-soft", dot: "bg-ink-faint" },
};

export const BALANCE_ACCENT: Record<EnergyBalance, AccentClasses> = {
  ipocalorica: { bg: "bg-gold-soft", border: "border-gold", text: "text-gold-ink", dot: "bg-gold" },
  normocalorica: { bg: "bg-teal-soft", border: "border-teal-soft-line", text: "text-teal", dot: "bg-teal" },
  ipercalorica: { bg: "bg-good/10", border: "border-good/40", text: "text-good", dot: "bg-good" },
};

/** Un colore fisso per macro, cosi' si riconoscono a colpo d'occhio in tutta la sezione Diete. */
export const MACRO_ACCENT = {
  protein: { text: "text-teal", dot: "bg-teal", bg: "bg-teal-soft", border: "border-teal-soft-line" },
  carbs: { text: "text-gold-ink", dot: "bg-gold", bg: "bg-gold-soft", border: "border-gold" },
  fat: { text: "text-bad", dot: "bg-bad", bg: "bg-bad/10", border: "border-bad/30" },
} satisfies Record<string, AccentClasses>;

const MEAL_TYPE_DOT: Record<string, string> = {
  colazione: "bg-gold",
  spuntino_mattina: "bg-ink-faint",
  pranzo: "bg-teal",
  spuntino_pomeriggio: "bg-ink-faint",
  cena: "bg-good",
  spuntino_sera: "bg-ink-faint",
  integratori: "bg-gold-bright",
};

export function mealTypeDotClass(mealType: string): string {
  return MEAL_TYPE_DOT[mealType] ?? "bg-ink-faint";
}

const DAY_LABEL_DOT: Record<string, string> = {
  ricarica: "bg-good",
  scarico: "bg-gold",
  allenamento: "bg-bad",
  gara: "bg-teal",
};

export function dayLabelDotClass(label: string | null): string {
  if (!label) return "bg-ink-faint/40";
  return DAY_LABEL_DOT[label.trim().toLowerCase()] ?? "bg-ink-faint";
}

const FOOD_CATEGORY_DOT: Record<string, string> = {
  cereali: "bg-gold",
  proteine_animali: "bg-bad",
  proteine_vegetali: "bg-good",
  latticini: "bg-gold-bright",
  grassi: "bg-ink-faint",
  verdura: "bg-good",
  frutta: "bg-gold",
  bevande: "bg-teal",
  dolci_snack: "bg-bad",
  condimenti: "bg-teal",
  integratori: "bg-gold-bright",
  altro: "bg-ink-faint",
};

export function foodCategoryDotClass(category: string): string {
  return FOOD_CATEGORY_DOT[category] ?? "bg-ink-faint";
}

export type ProteinSource =
  | "carne_rossa"
  | "carne_bianca"
  | "pesce_magro"
  | "pesce_grasso"
  | "salumi"
  | "uova"
  | "vegetale"
  | "latticini";

export const PROTEIN_SOURCE_LABELS: Record<ProteinSource, string> = {
  carne_rossa: "Carne rossa",
  carne_bianca: "Carne bianca",
  pesce_magro: "Pesce magro",
  pesce_grasso: "Pesce grasso",
  salumi: "Salumi",
  uova: "Uova",
  vegetale: "Vegetale",
  latticini: "Latticini",
};

/** Colori distinti per fonte proteica: servono a far "saltare all'occhio" come sono distribuite nella settimana. */
export const PROTEIN_SOURCE_ACCENT: Record<ProteinSource, AccentClasses> = {
  carne_rossa: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", dot: "bg-rose-500" },
  carne_bianca: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", dot: "bg-orange-500" },
  pesce_magro: { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700", dot: "bg-sky-500" },
  pesce_grasso: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", dot: "bg-blue-500" },
  salumi: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", dot: "bg-amber-600" },
  uova: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800", dot: "bg-yellow-500" },
  vegetale: { bg: "bg-lime-50", border: "border-lime-300", text: "text-lime-700", dot: "bg-lime-500" },
  latticini: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700", dot: "bg-violet-500" },
};

export function proteinSourceAccent(source: string | null | undefined): AccentClasses | null {
  if (!source) return null;
  return PROTEIN_SOURCE_ACCENT[source as ProteinSource] ?? null;
}

export function proteinSourceLabel(source: string | null | undefined): string | null {
  if (!source) return null;
  return PROTEIN_SOURCE_LABELS[source as ProteinSource] ?? source;
}

/** Indice 0=Lunedì..6=Domenica di oggi, coerente con WEEKDAY_LABELS. */
export function todayWeekdayMon0(): number {
  const jsDay = new Date().getDay(); // 0=Domenica..6=Sabato
  return (jsDay + 6) % 7;
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
  integratori: "Integratori",
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
  { key: "integratori", label: "Integratori" },
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

export interface RecipeMacros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Le ricette hanno kcal/macro già calcolati per 1 porzione: quantityPortions è il moltiplicatore. */
export function scaleRecipeToPortions(recipe: RecipeMacros, quantityPortions: number) {
  return {
    kcal: recipe.kcal * quantityPortions,
    protein: recipe.protein_g * quantityPortions,
    carbs: recipe.carbs_g * quantityPortions,
    fat: recipe.fat_g * quantityPortions,
  };
}
