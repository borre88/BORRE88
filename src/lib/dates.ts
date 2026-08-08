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
