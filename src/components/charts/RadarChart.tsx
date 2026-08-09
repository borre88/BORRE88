import { Card } from "../ui/Card";

export function RadarChart({ aree }: { aree: { nome: string; punteggio: number }[] }) {
  const cx = 160,
    cy = 148,
    R = 108,
    n = aree.length;
  const ang = (i: number) => -Math.PI / 2 + i * ((2 * Math.PI) / n);
  const poly = (f: number) =>
    aree.map((_, i) => `${(cx + Math.cos(ang(i)) * R * f).toFixed(1)},${(cy + Math.sin(ang(i)) * R * f).toFixed(1)}`).join(" ");
  const dato = aree
    .map(
      (a, i) =>
        `${(cx + Math.cos(ang(i)) * R * (a.punteggio / 20)).toFixed(1)},${(cy + Math.sin(ang(i)) * R * (a.punteggio / 20)).toFixed(1)}`,
    )
    .join(" ");

  return (
    <Card className="px-2.5 py-3.5">
      <svg viewBox="0 0 320 280" className="h-[250px] w-full">
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <polygon key={i} points={poly(f)} fill="none" stroke={f === 1 ? "var(--line)" : "var(--line-soft)"} strokeWidth="1" />
        ))}
        <polygon points={dato} fill="var(--brand)" fillOpacity="0.16" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
        {aree.map((a, i) => {
          const lx = cx + Math.cos(ang(i)) * (R + 26),
            ly = cy + Math.sin(ang(i)) * (R + 26) + 4;
          const anchor = Math.abs(lx - cx) < 12 ? "middle" : lx > cx ? "end" : "start";
          return (
            <text key={i} x={lx} y={ly} textAnchor={anchor} fontFamily="var(--font-ui)" fontSize="11" fontWeight="600" fill="var(--muted)">
              {a.nome}
            </text>
          );
        })}
      </svg>
    </Card>
  );
}
