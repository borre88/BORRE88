"use client";

import { useEffect, useMemo, useState } from "react";
import { MACRO_ACCENT } from "@/lib/diet-calc";

type WeightBasis = "corporeo" | "magra" | "ideale";

export function MacroSplitCard({
  targetKcal,
  weightKg,
  leanMassKg,
  heightCm,
  onChange,
}: {
  targetKcal: number | null;
  weightKg: number | null;
  leanMassKg: number | null;
  heightCm: number | null;
  onChange: (macro: { proteinG: number; carbsG: number; fatG: number }) => void;
}) {
  const [proteinPct, setProteinPct] = useState(20);
  const [fatPct, setFatPct] = useState(25);
  const [carbsPctManual, setCarbsPctManual] = useState(55);
  const [autoBalance, setAutoBalance] = useState(true);
  const [basis, setBasis] = useState<WeightBasis>("corporeo");

  const idealWeightKg = heightCm ? 22 * Math.pow(heightCm / 100, 2) : null;
  const basisWeightKg = basis === "corporeo" ? weightKg : basis === "magra" ? leanMassKg : idealWeightKg;

  const carbsPct = autoBalance ? Math.max(0, 100 - proteinPct - fatPct) : carbsPctManual;
  const totalPct = proteinPct + fatPct + carbsPct;

  const macros = useMemo(() => {
    if (!targetKcal) return null;
    const proteinG = Math.round((targetKcal * (proteinPct / 100)) / 4);
    const fatG = Math.round((targetKcal * (fatPct / 100)) / 9);
    const carbsG = Math.round((targetKcal * (carbsPct / 100)) / 4);
    return { proteinG, fatG, carbsG };
  }, [targetKcal, proteinPct, fatPct, carbsPct]);

  useEffect(() => {
    if (macros) onChange(macros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macros]);

  if (!targetKcal) {
    return (
      <div className="mb-5 rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center text-[12.5px] text-ink-faint">
        Imposta prima il bilancio energetico per ripartire le kcal tra i macronutrienti.
      </div>
    );
  }

  const basisOptions: { key: WeightBasis; label: string; value: number | null }[] = [
    { key: "corporeo", label: "Peso Corporeo", value: weightKg },
    { key: "magra", label: "Massa Magra", value: leanMassKg },
    { key: "ideale", label: "Peso ideale (BMI 22)", value: idealWeightKg },
  ];

  const rows: {
    key: "protein" | "fat" | "carbs";
    label: string;
    kcalPerG: number;
    pct: number;
    setPct: (v: number) => void;
    grams: number;
    accent: { bg: string; border: string; text: string; dot: string };
    disabled?: boolean;
  }[] = [
    {
      key: "protein",
      label: "Proteine",
      kcalPerG: 4,
      pct: proteinPct,
      setPct: setProteinPct,
      grams: macros?.proteinG ?? 0,
      accent: MACRO_ACCENT.protein,
    },
    {
      key: "fat",
      label: "Grassi",
      kcalPerG: 9,
      pct: fatPct,
      setPct: setFatPct,
      grams: macros?.fatG ?? 0,
      accent: MACRO_ACCENT.fat,
    },
    {
      key: "carbs",
      label: "Carboidrati",
      kcalPerG: 4,
      pct: carbsPct,
      setPct: setCarbsPctManual,
      grams: macros?.carbsG ?? 0,
      accent: MACRO_ACCENT.carbs,
      disabled: autoBalance,
    },
  ];

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5">
        <div>
          <div className="font-display text-[15px] font-bold">Ripartizione Macronutrienti</div>
          <div className="text-[11.5px] text-ink-faint">
            {basisWeightKg ? `Calcolo g/kg su ${basis === "corporeo" ? "peso corporeo" : basis === "magra" ? "massa magra" : "peso ideale"} ${basisWeightKg.toFixed(1)} kg` : "Dati insufficienti per il calcolo g/kg"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={autoBalance}
              onChange={(e) => setAutoBalance(e.target.checked)}
              className="h-3.5 w-3.5 accent-teal"
            />
            Auto-bilanciamento
          </label>
          {basisOptions.map((b) => (
            <button
              key={b.key}
              type="button"
              disabled={b.value === null}
              onClick={() => setBasis(b.key)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium disabled:opacity-40 ${
                basis === b.key ? "border-teal bg-teal text-white" : "border-line bg-cream text-ink-soft"
              }`}
            >
              {b.label}
              {b.value ? ` (${b.value.toFixed(1)})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.key} className={`rounded-lg border px-3.5 py-3 ${r.accent.border} ${r.accent.bg}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${r.accent.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${r.accent.dot}`} />
                {r.label}
              </span>
              <span className="rounded-full border border-line bg-surface px-1.5 py-0.5 text-[9.5px] font-semibold text-ink-faint">
                {r.kcalPerG} kcal/g
              </span>
            </div>

            <label className="mb-0.5 block text-[9.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Percentuale
            </label>
            <div className="mb-1 flex items-center gap-2">
              <input
                type="number"
                value={r.pct}
                disabled={r.disabled}
                onChange={(e) => r.setPct(Number(e.target.value))}
                className="w-14 rounded border border-line bg-surface px-1.5 py-1 text-[12px] outline-none focus:border-teal disabled:opacity-50"
              />
              <span className="text-[10.5px] text-ink-faint">% kcal</span>
            </div>
            <input
              type="range"
              min={0}
              max={70}
              value={r.pct}
              disabled={r.disabled}
              onChange={(e) => r.setPct(Number(e.target.value))}
              className="mb-2 w-full accent-current disabled:opacity-50"
              style={{ color: "var(--brand)" }}
            />

            {basisWeightKg && (
              <div className="mb-1.5 text-[10.5px] text-ink-faint">{(r.grams / basisWeightKg).toFixed(2)} g/kg</div>
            )}

            <div className="flex items-center justify-between border-t border-line/60 pt-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Totale</span>
              <span className="text-[13px] font-bold">
                {r.grams} g <span className="font-normal text-ink-faint">({Math.round(r.grams * r.kcalPerG)} kcal)</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {!autoBalance && totalPct !== 100 && (
        <p className="px-4 pb-3 text-[11px] font-medium text-bad">
          Le percentuali sommano a {totalPct}%, non 100%. Attiva l&apos;auto-bilanciamento o correggi i valori.
        </p>
      )}
    </div>
  );
}
