import type { Tables } from "@/lib/database.types";

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

export interface BodyMeasurementRow {
  key: MeasurementKey;
  label: string;
  iniziale: number | null;
  ultimo: number | null;
  diff: number | null;
}

/**
 * Iniziale = il primo valore mai inserito per quel campo specifico (non per forza
 * dalla prima rilevazione in assoluto, dato che il cliente inserisce solo alcune
 * misure a settimana). Ultimo = il valore più recente per quel campo.
 */
export function computeBodyMeasurements(checkins: Checkin[]) {
  const sorted = [...checkins].sort((a, b) => a.week_start.localeCompare(b.week_start));

  const rows: BodyMeasurementRow[] = BODY_MEASUREMENT_FIELDS.map((f) => {
    let iniziale: number | null = null;
    for (let i = 0; i < sorted.length; i++) {
      const v = sorted[i][f.key];
      if (v !== null && v !== undefined) {
        iniziale = v;
        break;
      }
    }
    let ultimo: number | null = null;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const v = sorted[i][f.key];
      if (v !== null && v !== undefined) {
        ultimo = v;
        break;
      }
    }
    const diff = iniziale !== null && ultimo !== null ? round1(ultimo - iniziale) : null;
    return { ...f, iniziale, ultimo, diff };
  }).filter((r) => r.iniziale !== null || r.ultimo !== null);

  const totale = round1(rows.reduce((sum, r) => sum + (r.diff ?? 0), 0));
  const hasTotale = rows.some((r) => r.diff !== null);

  return { sorted, rows, totale, hasTotale };
}
