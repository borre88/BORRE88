// il numero si legge da lontano, l'unità no
export const Stat = ({
  value,
  unit,
  color = "text-ink",
}: {
  value: string;
  unit?: string;
  color?: string;
}) => (
  <div className="flex items-baseline gap-1">
    <span className={`font-display font-bold text-[26px] leading-none ${color}`}>{value}</span>
    {unit && <span className="font-ui font-medium text-[10.5px] text-muted">{unit}</span>}
  </div>
);
