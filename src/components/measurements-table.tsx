import { ALL_METRICS, formatDateIt, type MeasurementLike, type MetricDef } from "@/lib/metrics";

type MeasurementRow = MeasurementLike & { id: string };

export function MeasurementsTable({
  entries,
  metrics = ALL_METRICS,
  renderRowActions,
}: {
  entries: MeasurementRow[];
  metrics?: MetricDef[];
  renderRowActions?: (entry: MeasurementRow) => React.ReactNode;
}) {
  if (entries.length === 0) return null;
  const reversed = [...entries].reverse();

  return (
    <div className="mt-5 rounded-lg border border-line bg-surface px-4 pb-2 pt-4">
      <div className="mb-2.5 text-sm font-semibold">Storico rilevazioni</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint">
                Data
              </th>
              {metrics.map((m) => (
                <th
                  key={m.key}
                  className="whitespace-nowrap px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-wide text-ink-faint"
                >
                  {m.label}
                </th>
              ))}
              {renderRowActions && <th />}
            </tr>
          </thead>
          <tbody>
            {reversed.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap border-t border-line px-2.5 py-2 font-medium">
                  {formatDateIt(e.date)}
                </td>
                {metrics.map((m) => (
                  <td key={m.key} className="whitespace-nowrap border-t border-line px-2.5 py-2 font-mono">
                    {e[m.key] ?? "—"}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="border-t border-line px-2.5 py-2">{renderRowActions(e)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
