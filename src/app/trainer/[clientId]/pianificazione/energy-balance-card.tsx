"use client";

import { Zap, Target, Flame } from "lucide-react";
import { ACTIVITY_LABELS, ACTIVITY_MULTIPLIERS } from "@/lib/health-score";
import { BALANCE_ACCENT, calculateTargetKcal, classifyEnergyBalance, type EnergyBalance } from "@/lib/diet-calc";

const BALANCE_TABS: { key: EnergyBalance; label: string; defaultVariation: number }[] = [
  { key: "ipocalorica", label: "Ipocalorica", defaultVariation: -15 },
  { key: "normocalorica", label: "Normocalorica", defaultVariation: 0 },
  { key: "ipercalorica", label: "Ipercalorica", defaultVariation: 12 },
];

export function EnergyBalanceCard({
  bmr,
  activityLevel,
  onActivityLevelChange,
  balanceTab,
  onBalanceTabChange,
  variationPercent,
  onVariationPercentChange,
}: {
  bmr: { value: number; label: string } | null;
  activityLevel: string;
  onActivityLevelChange: (v: string) => void;
  balanceTab: EnergyBalance;
  onBalanceTabChange: (v: EnergyBalance) => void;
  variationPercent: number;
  onVariationPercentChange: (v: number) => void;
}) {
  if (!bmr) {
    return (
      <div className="mb-5 rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center text-[12.5px] text-ink-faint">
        Scegli prima una formula in Energia &amp; Metabolismo per calcolare il bilancio energetico.
      </div>
    );
  }

  const tdee = bmr.value * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2);
  const targetKcal = Math.round(calculateTargetKcal(tdee, variationPercent));
  const balance = classifyEnergyBalance(variationPercent);
  const accent = BALANCE_ACCENT[balance];

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5">
        <div className="font-display text-[15px] font-bold">Bilancio Energetico</div>
        <div className="flex gap-1">
          {BALANCE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                onBalanceTabChange(t.key);
                onVariationPercentChange(t.defaultVariation);
              }}
              className={`rounded-full border px-3 py-1 text-[11.5px] font-medium ${
                balanceTab === t.key
                  ? `${BALANCE_ACCENT[t.key].border} ${BALANCE_ACCENT[t.key].bg} ${BALANCE_ACCENT[t.key].text}`
                  : "border-line bg-cream text-ink-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <div className="rounded-lg border border-teal-soft-line bg-teal-soft px-3.5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-teal">
            <Flame size={12} strokeWidth={2.4} />
            BMR (basale)
          </div>
          <div className="font-display text-xl font-bold">{Math.round(bmr.value)} kcal</div>
          <div className="mt-0.5 text-[10.5px] text-ink-faint">Formula: {bmr.label}</div>
        </div>

        <div className="rounded-lg border border-teal-soft-line bg-teal-soft px-3.5 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-teal">
            <Zap size={12} strokeWidth={2.4} />
            TDEE (mantenimento)
          </div>
          <div className="font-display text-xl font-bold">{Math.round(tdee)} kcal</div>
          <label className="mt-1.5 block text-[10px] text-ink-faint">Livello attività (PAL)</label>
          <select
            value={activityLevel}
            onChange={(e) => onActivityLevelChange(e.target.value)}
            className="mt-0.5 w-full rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] outline-none focus:border-teal"
          >
            {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={`rounded-lg border px-3.5 py-3 ${accent.border} ${accent.bg}`}>
          <div className={`mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${accent.text}`}>
            <Target size={12} strokeWidth={2.4} />
            Target calorico
          </div>
          <div className="font-display text-xl font-bold">{targetKcal} kcal</div>
          <label className="mt-1.5 block text-[10px] text-ink-faint">Variazione % sul TDEE</label>
          <input
            type="number"
            value={variationPercent}
            onChange={(e) => onVariationPercentChange(Number(e.target.value))}
            className="mt-0.5 w-full rounded-md border border-line bg-surface px-2 py-1 text-[11.5px] outline-none focus:border-teal"
          />
        </div>
      </div>
    </div>
  );
}
