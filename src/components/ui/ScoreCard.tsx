import { Card } from "./Card";

export const ScoreCard = ({
  score,
  bene,
  migliorare,
  onRecalc,
}: {
  score: number;
  bene: string[];
  migliorare: string[];
  onRecalc?: () => void;
}) => (
  <Card className="p-[18px]">
    <div className="flex items-center justify-between">
      <span className="font-ui font-bold text-[14px]">Punteggio salute</span>
      <button onClick={onRecalc} className="font-ui font-semibold text-[11.5px] text-faint underline">
        Ricalcola
      </button>
    </div>
    <div className="mt-3 mb-[18px] flex items-baseline gap-1.5">
      <span className="font-display font-bold text-[46px] leading-none text-gold">{score}</span>
      <span className="font-ui font-medium text-[15px] text-[rgba(28,28,26,.35)]">/ 20</span>
    </div>
    <Bullets titolo="Cosa va bene" items={bene} color="text-positive" />
    <div className="mt-3.5">
      <Bullets titolo="Cosa migliorare" items={migliorare} color="text-negative" />
    </div>
  </Card>
);

const Bullets = ({ titolo, items, color }: { titolo: string; items: string[]; color: string }) => (
  <>
    <div className={`font-ui font-bold text-[10.5px] uppercase tracking-[0.12em] ${color} mb-2`}>{titolo}</div>
    {items.map((t, i) => (
      <div key={i} className="mb-[5px] flex gap-2 font-ui font-medium text-[12.5px] leading-[1.55] text-[#3A3830]">
        <span className={color}>•</span>
        <span>{t}</span>
      </div>
    ))}
  </>
);
