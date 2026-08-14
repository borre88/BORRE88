import { ArrowRight } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { Gender } from "@/lib/health-score";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BodySilhouette } from "@/components/body-silhouette";

type Checkin = Tables<"weekly_checkins">;

export type MeasurementKey =
  | "braccio_sx_cm"
  | "braccio_dx_cm"
  | "petto_cm"
  | "vita_cm"
  | "fianchi_cm"
  | "glutei_cm"
  | "coscia_sx_cm"
  | "coscia_dx_cm"
  | "polpaccio_sx_cm"
  | "polpaccio_dx_cm"
  | "polso_sx_cm"
  | "polso_dx_cm";

export const BODY_MEASUREMENT_FIELDS: { key: MeasurementKey; label: string }[] = [
  { key: "braccio_sx_cm", label: "Braccio SX" },
  { key: "braccio_dx_cm", label: "Braccio DX" },
  { key: "petto_cm", label: "Petto" },
  { key: "vita_cm", label: "Vita" },
  { key: "fianchi_cm", label: "Fianchi" },
  { key: "glutei_cm", label: "Glutei" },
  { key: "coscia_sx_cm", label: "Coscia SX" },
  { key: "coscia_dx_cm", label: "Coscia DX" },
  { key: "polpaccio_sx_cm", label: "Polpaccio SX" },
  { key: "polpaccio_dx_cm", label: "Polpaccio DX" },
  { key: "polso_sx_cm", label: "Polso SX" },
  { key: "polso_dx_cm", label: "Polso DX" },
];

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function BodyMeasurementsCard({ checkins, gender }: { checkins: Checkin[]; gender: Gender | null }) {
  const sorted = [...checkins].sort((a, b) => a.week_start.localeCompare(b.week_start));
  if (sorted.length === 0) return null;

  const first = sorted[0];

  const rows = BODY_MEASUREMENT_FIELDS.map((f) => {
    const iniziale = first[f.key];
    let ultimo: number | null = null;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const v = sorted[i][f.key];
      if (v !== null && v !== undefined) {
        ultimo = v;
        break;
      }
    }
    const diff = iniziale !== null && iniziale !== undefined && ultimo !== null ? round1(ultimo - iniziale) : null;
    return { ...f, iniziale: iniziale ?? null, ultimo, diff };
  }).filter((r) => r.iniziale !== null || r.ultimo !== null);

  if (rows.length === 0) {
    return (
      <Card className="mb-5 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <BodySilhouette gender={gender} className="h-14 w-8 shrink-0 fill-teal" />
          <div>
            <SectionLabel>Misure corpo</SectionLabel>
            <p className="mt-1 text-[12px] text-ink-faint">
              Non ci sono ancora misure registrate: si aggiornano automaticamente dal check settimanale.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const totale = rows.reduce((sum, r) => sum + (r.diff ?? 0), 0);
  const hasTotale = rows.some((r) => r.diff !== null);

  return (
    <Card className="mb-5 px-4 pb-2 pt-4">
      <div className="mb-3 flex items-center gap-3">
        <BodySilhouette gender={gender} className="h-14 w-8 shrink-0 fill-teal" />
        <div>
          <SectionLabel>Misure corpo</SectionLabel>
          <p className="mt-0.5 text-[11.5px] text-ink-faint">Confronto tra la prima misurazione e le più recenti.</p>
        </div>
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            <th className="px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
              Misura
            </th>
            <th className="px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
              Iniziale
            </th>
            <th className="px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
              Ultimo
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="whitespace-nowrap border-t border-line px-2.5 py-2 font-medium">{r.label}</td>
              <td className="whitespace-nowrap border-t border-line px-2.5 py-2 font-display text-ink-faint">
                {r.iniziale !== null ? `${r.iniziale}cm` : "—"}
              </td>
              <td className="whitespace-nowrap border-t border-line px-2.5 py-2">
                <span className="inline-flex flex-wrap items-baseline gap-1.5">
                  <span className="inline-flex items-center gap-1 font-display font-medium text-teal">
                    <ArrowRight size={11} strokeWidth={2.2} className="text-ink-faint" />
                    {r.ultimo !== null ? `${r.ultimo}cm` : "—"}
                  </span>
                  {r.diff !== null && (
                    <span className="text-[10.5px] font-medium text-ink-faint">
                      ({r.diff > 0 ? "+" : ""}
                      {r.diff}cm)
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasTotale && (
        <div className="mt-1 flex items-center justify-between border-t border-line px-2.5 py-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">Totale</span>
          <span className="font-display text-sm font-semibold">
            {totale > 0 ? "+" : ""}
            {round1(totale)}cm
          </span>
        </div>
      )}
    </Card>
  );
}
