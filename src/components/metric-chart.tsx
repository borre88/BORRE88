"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricDef } from "@/lib/metrics";
import { formatDateIt } from "@/lib/metrics";

export function MetricChart({ metric, data }: { metric: MetricDef; data: { date: string; value: number }[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[12.5px] font-semibold">{metric.label}</span>
        <span className="ml-auto text-[10.5px] text-ink-faint">{metric.unit}</span>
      </div>
      {data.length === 0 ? (
        <div className="py-8 text-center text-xs text-ink-faint">Nessun dato per questa metrica</div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateIt}
              tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }}
              axisLine={{ stroke: "var(--color-line)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }}
              axisLine={false}
              tickLine={false}
              width={34}
              domain={["auto", "auto"]}
            />
            <Tooltip
              labelFormatter={(label) => formatDateIt(String(label))}
              formatter={(value) => [`${value} ${metric.unit}`, metric.label] as [string, string]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-line)" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-teal)"
              strokeWidth={2.25}
              dot={{ r: 3, fill: "var(--color-teal)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
