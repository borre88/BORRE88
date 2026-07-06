import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LongevityScoreCard } from "@/components/longevity-score-card";
import { buildFeedback } from "@/lib/longevity/feedback";

export default async function LongevityPage() {
  const session = await auth();

  const [latest, history] = await Promise.all([
    prisma.longevityAssessment.findFirst({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.longevityAssessment.findMany({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: "desc" },
      skip: 1,
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Longevity Score</h1>
          <p className="mt-1 text-stone-600">
            Un quadro sintetico delle tue abitudini su 5 aree chiave per la
            longevità.
          </p>
        </div>
        <Link
          href="/dashboard/longevity/new"
          className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          {latest ? "Aggiorna il questionario" : "Compila il questionario"}
        </Link>
      </div>

      {!latest ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
          Non hai ancora compilato il questionario. Rispondendo ad alcune
          domande su allenamento, nutrizione, sonno, gestione dello stress e
          prevenzione otterrai il tuo Longevity Score e consigli mirati.
        </div>
      ) : (
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
      )}

      {history.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900">Storico</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((entry) => (
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
    </div>
  );
}
