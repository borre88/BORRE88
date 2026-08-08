"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { AreaScore } from "@/lib/health-report";

export function ReportRadarChart({ areas }: { areas: AreaScore[] }) {
  const data = areas.map((a) => ({
    label: a.label,
    score: a.result?.score ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--color-line)" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11.5, fill: "var(--color-ink-soft)" }} />
        <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} tickCount={5} />
        <Radar
          dataKey="score"
          stroke="var(--color-teal)"
          fill="var(--color-teal)"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
