import { Card } from "./Card";
import { Stat } from "./Stat";

export const MetricCard = ({
  nome,
  val,
  unita,
  trend,
}: {
  nome: string;
  val: string;
  unita?: string;
  trend?: string;
}) => (
  <Card className="p-[14px]">
    <div className="font-ui font-semibold text-[11.5px] text-muted">{nome}</div>
    <div className="my-[9px]">
      <Stat value={val} unit={unita} />
    </div>
    {trend && <div className="font-ui font-medium text-[11px] text-faint">— {trend}</div>}
  </Card>
);
