export type AppointmentType = "visita" | "check" | "valutazione" | "altro";

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  visita: "Visita",
  check: "Check",
  valutazione: "Valutazione",
  altro: "Altro",
};

export const APPOINTMENT_TYPES: { key: AppointmentType; label: string }[] = [
  { key: "visita", label: "Visita" },
  { key: "check", label: "Check" },
  { key: "valutazione", label: "Valutazione" },
  { key: "altro", label: "Altro" },
];

interface AccentClasses {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

/** Colori per tipo scadenza, sui toni del brand. */
export const APPOINTMENT_TYPE_ACCENT: Record<AppointmentType, AccentClasses> = {
  visita: { bg: "bg-teal-soft", border: "border-teal-soft-line", text: "text-teal", dot: "bg-teal" },
  check: { bg: "bg-gold-soft", border: "border-gold", text: "text-gold-ink", dot: "bg-gold" },
  valutazione: { bg: "bg-good/10", border: "border-good/40", text: "text-good", dot: "bg-good" },
  altro: { bg: "bg-cream", border: "border-line", text: "text-ink-soft", dot: "bg-ink-faint" },
};

export function appointmentTypeAccent(type: string): AccentClasses {
  return APPOINTMENT_TYPE_ACCENT[type as AppointmentType] ?? APPOINTMENT_TYPE_ACCENT.altro;
}

export function appointmentTypeLabel(type: string): string {
  return APPOINTMENT_TYPE_LABELS[type as AppointmentType] ?? "Altro";
}

export const RECURRENCE_WEEK_OPTIONS = [1, 2, 4, 6, 8, 12];
export const RECURRENCE_OCCURRENCE_OPTIONS = [4, 6, 8, 12, 24];
