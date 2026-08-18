/** Monday of the week containing `d`, as YYYY-MM-DD (local time). */
export function getMondayISO(d: Date): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday .. 6 = Saturday
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function formatWeekLabel(mondayIso: string): string {
  const monday = new Date(mondayIso + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

/** "oggi", "ieri", "N giorni fa", oppure la data per periodi più lunghi. */
export function formatRelativeIt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "oggi";
  if (diffDays === 1) return "ieri";
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

/** YYYY-MM-DD per una Date, in ora locale (evita lo shift UTC di toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Griglia di 6 settimane (Lun-Dom, 42 giorni) per il mese dato, coi giorni dei mesi adiacenti a riempimento. */
export function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = lunedì .. 6 = domenica
  const start = new Date(year, month, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Es. "Marzo 2026". */
export function formatMonthLabel(year: number, month: number): string {
  const label = new Date(year, month, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
