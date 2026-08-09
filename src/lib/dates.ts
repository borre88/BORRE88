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
