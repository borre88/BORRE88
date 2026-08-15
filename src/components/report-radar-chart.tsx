"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { AreaScore } from "@/lib/health-report";

export function ReportRadarChart({
  areas,
  // Il PDF stampato non risolve sempre in modo affidabile le variabili CSS
  // dentro l'SVG generato da Recharts: per quel contesto passiamo colori
  // fissi invece di var(--...) così il grafico è leggibile a colpo sicuro.
  gridColor = "var(--chart-grid)",
  labelColor = "var(--color-ink)",
  areaColor = "var(--color-teal)",
}: {
  areas: AreaScore[];
  gridColor?: string;
  labelColor?: string;
  areaColor?: string;
}) {
  const data = areas.map((a) => ({
    label: a.label,
    score: a.result?.score ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11.5, fill: labelColor }} />
        <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} tickCount={5} />
        <Radar dataKey="score" stroke={areaColor} fill={areaColor} fillOpacity={0.35} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
