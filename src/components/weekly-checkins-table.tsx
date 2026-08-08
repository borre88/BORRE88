import { formatWeekLabel } from "@/lib/dates";
import type { Tables } from "@/lib/database.types";

type Checkin = Tables<"weekly_checkins">;

const COLUMNS: { key: keyof Checkin; label: string }[] = [
  { key: "weight_kg", label: "Peso" },
  { key: "workouts_count", label: "Allenamenti" },
  { key: "tiredness", label: "Stanchezza" },
  { key: "energy", label: "Energia" },
  { key: "diet_slips", label: "Sgarri" },
];

export function WeeklyCheckinsTable({ checkins, title = "Check-in settimanali" }: { checkins: Checkin[]; title?: string }) {
  if (checkins.length === 0) return null;

  return (
    <div className="rounded-lg border border-line bg-surface px-4 pb-2 pt-4">
      <div className="mb-2.5 text-sm font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
                Settimana
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className="whitespace-nowrap px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint"
                >
                  {c.label}
                </th>
              ))}
              <th className="whitespace-nowrap px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {checkins.map((h) => (
              <tr key={h.id}>
                <td className="whitespace-nowrap border-t border-line px-2.5 py-2 font-medium">
                  {formatWeekLabel(h.week_start)}
                </td>
                {COLUMNS.map((c) => (
                  <td key={c.key} className="whitespace-nowrap border-t border-line px-2.5 py-2 font-mono">
                    {(h[c.key] as number | null) ?? "—"}
                  </td>
                ))}
                <td className="max-w-[220px] border-t border-line px-2.5 py-2 text-ink-soft">
                  {h.notes ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
