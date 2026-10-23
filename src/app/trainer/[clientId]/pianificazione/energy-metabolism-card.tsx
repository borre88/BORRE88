"use client";

import { useMemo, useState } from "react";
import { Flame, Check } from "lucide-react";
import { computeAllBMRFormulas, type Gender } from "@/lib/health-score";

export function EnergyMetabolismCard({
  weightKg,
  heightCm,
  age,
  gender,
  bodyFatPercent,
  measurementDate,
  selectedLabel,
  onUseForPlanning,
}: {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  gender: Gender | null;
  bodyFatPercent: number | null;
  measurementDate: string | null;
  selectedLabel: string | null;
  onUseForPlanning: (kcal: number, label: string) => void;
}) {
  const [selectedKey, setSelectedKey] = useState("mifflin");

  const formulas = useMemo(() => {
    if (!weightKg || !heightCm || age === null || !gender) return [];
    return computeAllBMRFormulas({ weightKg, heightCm, age, gender, bodyFatPercent });
  }, [weightKg, heightCm, age, gender, bodyFatPercent]);

  const selected = formulas.find((f) => f.key === selectedKey) ?? formulas[0] ?? null;
  const leanMassKg = bodyFatPercent !== null && weightKg ? weightKg * (1 - bodyFatPercent / 100) : null;

  const ageBandLabel = age === null ? "—" : age < 18 ? "Under 18" : age < 65 ? "Adulti" : "Anziani";

  const maxKcal = Math.max(...formulas.map((f) => f.kcal ?? 0), 1);

  if (!weightKg || !heightCm || age === null || !gender) {
    return (
      <div className="mb-5 rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center text-[12.5px] text-ink-faint">
        Servono peso, altezza, data di nascita e sesso del cliente (da una misurazione e dal profilo) per stimare il
        metabolismo.
      </div>
    );
  }

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-ink">
            <Flame size={17} strokeWidth={2.2} />
          </span>
          <div>
            <div className="font-display text-[15px] font-bold">Energia & Metabolismo</div>
            <div className="text-[11.5px] text-ink-faint">
              Stima BMR multi-formula · adattata a sesso, età, popolazione clinica
            </div>
          </div>
        </div>
        <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[10.5px] font-semibold text-ink-soft">
          {ageBandLabel}
        </span>
      </div>

      <div className="px-4 pt-3 text-[11.5px] text-ink-faint">
        Calcolato su peso {weightKg} kg · altezza {heightCm} cm
        {leanMassKg !== null && ` · massa magra ${leanMassKg.toFixed(1)} kg`}
        {measurementDate && ` (misurazione del ${new Date(measurementDate + "T00:00:00").toLocaleDateString("it-IT")})`}
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_220px]">
        <div className="space-y-1.5">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
            Seleziona formula
          </div>
          {formulas.map((f) => {
            const disabled = f.kcal === null;
            const isSelected = selected?.key === f.key;
            return (
              <button
                key={f.key}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedKey(f.key)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected ? "border-teal bg-teal-soft" : "border-line bg-cream hover:border-teal-soft-line"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[12.5px] font-semibold ${isSelected ? "text-teal" : "text-ink"}`}>
                      {f.label}
                    </span>
                    {f.recommended && (
                      <span className="rounded-full bg-good/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-good">
                        Consigliata
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">
                    {disabled ? f.unavailableReason : f.description}
                  </p>
                  <p className="mt-0.5 text-[10px] italic text-ink-faint/80">{f.citation}</p>
                </div>
                <span className={`shrink-0 text-[14px] font-bold ${isSelected ? "text-teal" : "text-ink-soft"}`}>
                  {f.kcal !== null ? `${Math.round(f.kcal)} kcal` : "—"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-teal-soft-line bg-teal-soft px-4 py-4 text-center lg:sticky lg:top-4">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-teal">Risultato stimato</div>
          <div className="font-display text-3xl font-bold text-teal">
            {selected?.kcal !== null && selected ? Math.round(selected.kcal) : "—"}
          </div>
          <div className="mb-3 text-[11px] text-ink-faint">kcal / die</div>
          <div className="mb-3 text-[12px] font-medium">{selected?.label}</div>
          <button
            type="button"
            disabled={!selected || selected.kcal === null}
            onClick={() => selected?.kcal !== null && selected && onUseForPlanning(Math.round(selected.kcal), selected.label)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
          >
            {selectedLabel === selected?.label ? <Check size={13} strokeWidth={2.4} /> : <Flame size={13} strokeWidth={2.2} />}
            {selectedLabel === selected?.label ? "In uso per la pianificazione" : "Usa per la pianificazione"}
          </button>
        </div>
      </div>

      <div className="border-t border-line px-4 py-3.5">
        <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
          Confronto formule
        </div>
        <div className="space-y-1.5">
          {formulas
            .filter((f) => f.kcal !== null)
            .map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-[11px]">
                <span className="w-32 shrink-0 truncate font-medium">{f.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                  <div
                    className={`h-full rounded-full ${selected?.key === f.key ? "bg-teal" : "bg-gold"}`}
                    style={{ width: `${((f.kcal ?? 0) / maxKcal) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-semibold">{Math.round(f.kcal ?? 0)} kcal</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
