import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { synthesizeReport, type AreaScore } from "@/lib/health-report";
import { ReportRadarChart } from "@/components/report-radar-chart";
import { AnimatedNumber } from "@/components/animated-number";

function scoreColor(score: number) {
  if (score >= 15) return "text-good";
  if (score >= 10) return "text-gold";
  return "text-bad";
}

export function HealthReportView({
  clientName,
  reportDate,
  areas,
}: {
  clientName: string;
  reportDate: string | null;
  areas: AreaScore[];
}) {
  const { strongAreas, weakAreas, averageScore } = synthesizeReport(areas);

  return (
    <div>
      <div className="mb-5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">
          Report generale della salute
        </div>
        <h2 className="font-display text-2xl font-bold">{clientName}</h2>
        <p className="text-xs text-ink-faint">
          {reportDate
            ? `Basato sulla rilevazione del ${new Date(reportDate + "T00:00:00").toLocaleDateString("it-IT")}`
            : "Nessuna rilevazione disponibile"}
        </p>
      </div>

      {averageScore !== null && (
        <div className="mb-5 flex items-baseline gap-2">
          <span className="text-[11px] font-medium text-ink-soft">Punteggio medio</span>
          <AnimatedNumber
            value={averageScore}
            decimals={1}
            className={`font-display text-2xl font-bold ${scoreColor(averageScore)}`}
          />
          <span className="text-xs text-ink-faint">/ 20</span>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-line bg-surface px-4 py-3">
        <ReportRadarChart areas={areas} />
      </div>

      {(strongAreas.length > 0 || weakAreas.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {strongAreas.length > 0 && (
            <div className="rounded-lg border border-good/30 bg-good/5 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-good">
                <ThumbsUp size={12} strokeWidth={2.5} /> Aree di forza
              </div>
              <p className="text-[13px] text-ink-soft">{strongAreas.join(", ")}</p>
            </div>
          )}
          {weakAreas.length > 0 && (
            <div className="rounded-lg border border-bad/30 bg-bad/5 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-bad">
                <ThumbsDown size={12} strokeWidth={2.5} /> Aree da migliorare
              </div>
              <p className="text-[13px] text-ink-soft">{weakAreas.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {areas.map((area) => (
          <div key={area.key} className="rounded-lg border border-line bg-surface px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles size={13} strokeWidth={2.2} className="text-gold" />
                {area.label}
              </div>
              {area.result && (
                <span className={`flex items-baseline gap-0.5 font-display text-base font-bold ${scoreColor(area.result.score)}`}>
                  <AnimatedNumber value={area.result.score} />/20
                </span>
              )}
            </div>
            {!area.result ? (
              <p className="text-[12.5px] text-ink-faint">{area.missingReason ?? "Dati non disponibili"}</p>
            ) : (
              <>
                {area.result.strengths.length > 0 && (
                  <ul className="mb-1.5 list-disc space-y-0.5 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
                    {area.result.strengths.map((s, i) => (
                      <li key={`s${i}`}>{s}</li>
                    ))}
                  </ul>
                )}
                {area.result.weaknesses.length > 0 && (
                  <ul className="list-disc space-y-0.5 pl-4 text-[12.5px] leading-relaxed text-bad">
                    {area.result.weaknesses.map((w, i) => (
                      <li key={`w${i}`}>{w}</li>
                    ))}
                  </ul>
                )}
                {area.result.strengths.length === 0 && area.result.weaknesses.length === 0 && (
                  <p className="text-[12.5px] text-ink-faint">Nessuna osservazione particolare.</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
