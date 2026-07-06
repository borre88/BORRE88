import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LongevityScoreCard } from "@/components/longevity-score-card";
import { buildFeedback } from "@/lib/longevity/feedback";
import { describeAnswers } from "@/lib/longevity/describe";
import type { Answers } from "@/lib/longevity/scoring";

export default async function AdminClientLongevityPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      longevityAssessments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client || client.role !== "CLIENT") notFound();

  const [latest, ...previous] = client.longevityAssessments;
  const details = latest
    ? describeAnswers(JSON.parse(latest.answersJson) as Answers)
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/longevity" className="text-sm text-emerald-700 hover:underline">
          &larr; Torna alla panoramica Longevity Score
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">{client.name}</h1>
        <p className="mt-1 text-stone-600">{client.email}</p>
      </div>

      {!latest ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
          Questo cliente non ha ancora compilato il questionario Longevity
          Score.
        </div>
      ) : (
        <>
          <LongevityScoreCard
            feedback={buildFeedback({
              training: latest.trainingScore,
              nutrition: latest.nutritionScore,
              sleep: latest.sleepScore,
              stress: latest.stressScore,
              prevention: latest.preventionScore,
              total: latest.totalScore,
            })}
            createdAt={latest.createdAt}
          />

          {details && details.extras.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900">
                Dati aggiuntivi (massimali, integratori, esami)
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {details.extras.map((extra, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
                    <span className="text-stone-500">
                      {extra.category} — {extra.label}
                    </span>
                    <span className="font-medium text-stone-900">{extra.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details && (
            <details className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer font-semibold text-stone-900">
                Tutte le risposte al questionario
              </summary>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {details.questions.map((q, i) => (
                  <li key={i} className="border-b border-stone-100 pb-2 last:border-0">
                    <p className="text-xs uppercase tracking-wide text-stone-400">
                      {q.category}
                    </p>
                    <p className="text-stone-700">{q.label}</p>
                    <p className="font-medium text-stone-900">{q.answer}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {previous.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900">Storico punteggi</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {previous.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between text-sm text-stone-600"
                  >
                    <span>
                      {entry.createdAt.toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-medium text-stone-900">
                      {entry.totalScore} / 100
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
