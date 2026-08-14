import { ArrowRight, Ruler } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { Gender } from "@/lib/health-score";
import { computeBodyMeasurements } from "@/lib/body-measurements";
import { BodySilhouette } from "@/components/body-silhouette";

type Checkin = Tables<"weekly_checkins">;

export function BodyMeasurementsSummary({ checkins, gender }: { checkins: Checkin[]; gender: Gender | null }) {
  const { rows, totale, hasTotale } = computeBodyMeasurements(checkins);
  if (rows.length === 0) return null;

  const silhouetteFill = gender === "maschio" ? "fill-teal" : "fill-teal/50";

  return (
    <div className="mt-8 border-t border-line pt-6">
      <div className="mb-4 flex items-center gap-3">
        <BodySilhouette gender={gender} className={`h-14 w-5 shrink-0 ${silhouetteFill}`} />
        <div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-gold">
            <Ruler size={12} strokeWidth={2.2} />
            Misure corpo
          </div>
          <h3 className="font-display text-lg font-bold">Sintesi delle misurazioni</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-cream">
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">Misura</th>
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">Iniziale</th>
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">Ultimo</th>
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
                Differenza
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="whitespace-nowrap border-t border-line px-3 py-1.5 font-medium">{r.label}</td>
                <td className="whitespace-nowrap border-t border-line px-3 py-1.5 font-display text-ink-faint">
                  {r.iniziale !== null ? `${r.iniziale}cm` : "—"}
                </td>
                <td className="whitespace-nowrap border-t border-line px-3 py-1.5 font-display font-medium text-teal">
                  <span className="inline-flex items-center gap-1">
                    <ArrowRight size={10} strokeWidth={2.2} className="text-ink-faint" />
                    {r.ultimo !== null ? `${r.ultimo}cm` : "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap border-t border-line px-3 py-1.5 font-display">
                  {r.diff !== null ? `${r.diff > 0 ? "+" : ""}${r.diff}cm` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          {hasTotale && (
            <tfoot>
              <tr className="bg-cream">
                <td className="whitespace-nowrap border-t border-line px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
                  Totale
                </td>
                <td className="border-t border-line px-3 py-2" />
                <td className="border-t border-line px-3 py-2" />
                <td className="whitespace-nowrap border-t border-line px-3 py-2 font-display font-semibold">
                  {totale > 0 ? "+" : ""}
                  {totale}cm
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
