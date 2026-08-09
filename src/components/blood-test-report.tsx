import { TrendingUp, TrendingDown, Check } from "lucide-react";
import type { MarkerReading } from "@/lib/blood-report";

export function BloodTestReport({ readings }: { readings: MarkerReading[] }) {
  if (readings.length === 0) {
    return <p className="text-[12.5px] text-ink-faint">Nessun valore inserito per questo esame.</p>;
  }

  const outOfRange = readings.filter((r) => r.status !== "normal");

  return (
    <div>
      {outOfRange.length === 0 ? (
        <p className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium text-good">
          <Check size={14} strokeWidth={2.5} /> Tutti i valori inseriti sono nel range di riferimento.
        </p>
      ) : (
        <p className="mb-3 text-[12.5px] font-medium text-bad">
          {outOfRange.length} valore{outOfRange.length > 1 ? "i" : ""} fuori dal range di riferimento.
        </p>
      )}

      <div className="space-y-2">
        {readings.map((r) => (
          <div
            key={r.key}
            className={`rounded-lg border px-3.5 py-2.5 ${
              r.status === "normal" ? "border-line bg-cream" : "border-bad/30 bg-bad/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">{r.label}</span>
              <span className="flex items-center gap-1 font-display text-[13px]">
                {r.status === "high" && <TrendingUp size={13} strokeWidth={2.5} className="text-bad" />}
                {r.status === "low" && <TrendingDown size={13} strokeWidth={2.5} className="text-bad" />}
                {r.value} {r.unit}
              </span>
            </div>
            <div className="text-[11px] text-ink-faint">
              Riferimento: {r.min ?? "—"}–{r.max ?? "—"} {r.unit}
            </div>
            {r.status !== "normal" && r.advice && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{r.advice}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] italic leading-relaxed text-ink-faint">
        Indicazioni generali e non sostitutive di un parere medico. Per valori significativamente
        fuori norma o persistenti, consulta un medico.
      </p>
    </div>
  );
}
