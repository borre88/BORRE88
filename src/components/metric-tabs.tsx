"use client";

import { useState } from "react";
import { METRIC_GROUPS, type MeasurementLike } from "@/lib/metrics";
import { MetricChart } from "./metric-chart";

export function MetricTabs({ entries }: { entries: MeasurementLike[] }) {
  const [active, setActive] = useState(METRIC_GROUPS[0].key);
  const group = METRIC_GROUPS.find((g) => g.key === active)!;

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface px-8 py-8 text-center text-sm text-ink-faint">
        Nessuna rilevazione registrata. Aggiungi la prima per iniziare a vedere l&apos;andamento.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
        {METRIC_GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setActive(g.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2 text-sm font-medium ${
              active === g.key ? "border-teal text-teal" : "border-transparent text-ink-faint"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {group.metrics.map((m) => {
          const data = entries
            .filter((e) => e[m.key] !== null && e[m.key] !== undefined)
            .map((e) => ({ date: e.date, value: Number(e[m.key]) }));
          return <MetricChart key={m.key} metric={m} data={data} />;
        })}
      </div>
    </div>
  );
}
