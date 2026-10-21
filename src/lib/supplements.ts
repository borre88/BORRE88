export const SUPPLEMENT_CATEGORY_ACCENT: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Fitness: { bg: "bg-teal-soft", text: "text-teal", border: "border-teal/30", dot: "bg-teal" },
  Performance: { bg: "bg-gold-soft", text: "text-gold-ink", border: "border-gold/30", dot: "bg-gold" },
  Wellness: { bg: "bg-good/10", text: "text-good", border: "border-good/30", dot: "bg-good" },
};

export function firstSupplementCategory(category: string | null): string {
  if (!category) return "Altro";
  return category.split(",")[0].trim();
}

export function supplementCategoryAccent(category: string | null) {
  const key = firstSupplementCategory(category);
  return SUPPLEMENT_CATEGORY_ACCENT[key] ?? SUPPLEMENT_CATEGORY_ACCENT.Fitness;
}

export function formatSupplementPrice(priceMin: number | null, priceMax: number | null): string {
  if (priceMin == null) return "";
  if (priceMax != null && priceMax !== priceMin) {
    return `${priceMin.toFixed(2)}–${priceMax.toFixed(2)} €`;
  }
  return `${priceMin.toFixed(2)} €`;
}
