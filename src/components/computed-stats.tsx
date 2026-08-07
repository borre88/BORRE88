import {
  ACTIVITY_LABELS,
  calculateBMI,
  calculateBMR,
  calculateHeartRateZones,
  calculateTDEE,
  calculateWaistHipRatio,
  estimateBodyFatPercent,
  type Gender,
  type Measurement,
} from "@/lib/health-score";

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-line bg-cream px-3.5 py-3">
      <div className="mb-1 text-[11px] font-medium text-ink-soft">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg font-medium">{value}</span>
        {unit && <span className="text-[10.5px] text-ink-faint">{unit}</span>}
      </div>
    </div>
  );
}

export function CardioStats({ measurement, age }: { measurement: Measurement | null; age: number | null }) {
  if (!measurement?.resting_hr || age === null) {
    return (
      <p className="mb-5 text-[12.5px] text-ink-faint">
        Inserisci la FC a riposo (e la data di nascita del cliente) per calcolare le zone di allenamento.
      </p>
    );
  }
  const zones = calculateHeartRateZones(age, measurement.resting_hr);
  return (
    <div className="mb-5 rounded-lg border border-line bg-surface px-4 pb-2 pt-3.5">
      <div className="mb-2.5 text-sm font-semibold">Zone di allenamento (metodo Karvonen)</div>
      <div className="grid grid-cols-1 gap-1.5 pb-3 sm:grid-cols-5">
        {zones.map((z) => (
          <div key={z.zone} className="rounded-md bg-cream px-2.5 py-2 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gold">Zona {z.zone}</div>
            <div className="font-mono text-sm font-medium">
              {z.bpmMin}-{z.bpmMax}
            </div>
            <div className="text-[10px] text-ink-faint">{z.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnthropometryStats({
  measurement,
  age,
  gender,
}: {
  measurement: Measurement | null;
  age: number | null;
  gender: Gender | null;
}) {
  if (!measurement) return null;
  const { weight_kg, height_cm, waist_cm, hip_cm, neck_cm, activity_level } = measurement;

  const cards: React.ReactNode[] = [];

  if (weight_kg && height_cm) {
    const bmi = calculateBMI(weight_kg, height_cm);
    cards.push(<StatCard key="bmi" label="BMI" value={bmi.toFixed(1)} />);
  }
  if (waist_cm && hip_cm) {
    const whr = calculateWaistHipRatio(waist_cm, hip_cm);
    cards.push(<StatCard key="whr" label="Rapporto vita/fianchi" value={whr.toFixed(2)} />);
  }
  if (!measurement.body_fat_percent && waist_cm && neck_cm && height_cm && gender) {
    const bf = estimateBodyFatPercent(gender, waist_cm, neck_cm, height_cm, hip_cm ?? undefined);
    if (bf !== null) cards.push(<StatCard key="bf" label="Massa grassa (stimata)" value={bf.toFixed(1)} unit="%" />);
  }
  if (weight_kg && height_cm && age !== null && gender) {
    const bmr = calculateBMR(weight_kg, height_cm, age, gender);
    cards.push(<StatCard key="bmr" label="Metabolismo basale" value={Math.round(bmr).toString()} unit="kcal/giorno" />);
    if (activity_level) {
      const tdee = calculateTDEE(bmr, activity_level);
      cards.push(
        <StatCard
          key="tdee"
          label={`TDEE (${ACTIVITY_LABELS[activity_level]?.split(" ")[0] ?? activity_level})`}
          value={Math.round(tdee).toString()}
          unit="kcal/giorno"
        />
      );
    }
  }

  if (cards.length === 0) return null;

  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">{cards}</div>
  );
}
