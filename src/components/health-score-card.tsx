"use client";

import { useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  scoreCardiovascular,
  scoreSleep,
  scoreAnthropometry,
  scoreStrength,
  scoreNutrition,
  type Gender,
  type Measurement,
  type ScoreResult,
} from "@/lib/health-score";

export type HealthArea = "cardio" | "sonno" | "antropometria" | "forza" | "alimentare";

const NEEDS_GENDER: HealthArea[] = ["cardio", "antropometria", "forza"];
const NEEDS_AGE: HealthArea[] = ["cardio"];

function computeScore(area: HealthArea, m: Measurement, gender: Gender | null, age: number | null): ScoreResult | null {
  switch (area) {
    case "cardio":
      return gender && age !== null ? scoreCardiovascular(m, age, gender) : null;
    case "sonno":
      return scoreSleep(m);
    case "antropometria":
      return gender ? scoreAnthropometry(m, gender) : null;
    case "forza":
      return gender ? scoreStrength(m, gender) : null;
    case "alimentare":
      return scoreNutrition(m);
  }
}

function scoreColor(score: number) {
  if (score >= 15) return "text-good";
  if (score >= 10) return "text-gold";
  return "text-bad";
}

export function HealthScoreCard({
  area,
  measurement,
  gender,
  age,
}: {
  area: HealthArea;
  measurement: Measurement | null;
  gender: Gender | null;
  age: number | null;
}) {
  const [result, setResult] = useState<ScoreResult | null | "missing-data">(null);

  const missingProfileData =
    (NEEDS_GENDER.includes(area) && !gender) || (NEEDS_AGE.includes(area) && age === null);

  function handleCalculate() {
    if (!measurement) {
      setResult("missing-data");
      return;
    }
    const r = computeScore(area, measurement, gender, age);
    setResult(r ?? "missing-data");
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface px-5 py-4">
      {result === null || result === "missing-data" ? (
        <>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={missingProfileData}
            className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Sparkles size={15} strokeWidth={2.2} />
            Calcola la tua salute
          </button>
          {missingProfileData && (
            <p className="mt-2 text-[11.5px] text-ink-faint">
              Servono sesso {NEEDS_AGE.includes(area) ? "e data di nascita " : ""}del cliente per questo calcolo
              (modificabili dalla scheda cliente).
            </p>
          )}
          {result === "missing-data" && !missingProfileData && (
            <p className="mt-2 text-[11.5px] text-ink-faint">
              Non ci sono ancora abbastanza dati in quest&apos;area per calcolare un punteggio.
            </p>
          )}
        </>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles size={15} strokeWidth={2.2} className="text-gold" />
              Punteggio salute
            </div>
            <button type="button" onClick={() => setResult(null)} className="text-[11px] text-ink-faint underline">
              Ricalcola
            </button>
          </div>
          <div className="mb-4 flex items-baseline gap-1.5">
            <span className={`font-mono text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}</span>
            <span className="text-sm text-ink-faint">/ 20</span>
          </div>
          {result.strengths.length > 0 && (
            <div className="mb-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-good">
                <ThumbsUp size={12} strokeWidth={2.5} /> Cosa va bene
              </div>
              <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.weaknesses.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-bad">
                <ThumbsDown size={12} strokeWidth={2.5} /> Cosa migliorare
              </div>
              <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
                {result.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.strengths.length === 0 && result.weaknesses.length === 0 && (
            <p className="text-[12.5px] text-ink-faint">Nessuna osservazione particolare con i dati disponibili.</p>
          )}
        </div>
      )}
    </div>
  );
}
