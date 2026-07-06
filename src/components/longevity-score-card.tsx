import type { AssessmentFeedback, Tier } from "@/lib/longevity/feedback";

const TIER_STYLES: Record<Tier, { badge: string; bar: string }> = {
  critical: { badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500" },
  improve: { badge: "bg-amber-50 text-amber-800 border-amber-200", bar: "bg-amber-500" },
  good: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  excellent: { badge: "bg-emerald-100 text-emerald-800 border-emerald-300", bar: "bg-emerald-700" },
};

export function LongevityScoreCard({
  feedback,
  createdAt,
}: {
  feedback: AssessmentFeedback;
  createdAt?: Date;
}) {
  const totalStyle = TIER_STYLES[feedback.totalTier];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500">Longevity Score</p>
            <p className="mt-1 text-4xl font-semibold text-stone-900">
              {feedback.total}
              <span className="text-lg font-normal text-stone-400"> / 100</span>
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${totalStyle.badge}`}
          >
            {feedback.totalTierLabel}
          </span>
        </div>
        {createdAt && (
          <p className="mt-2 text-xs text-stone-400">
            Rilevato il{" "}
            {createdAt.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <p className="mt-4 text-sm text-stone-700">{feedback.summary}</p>

        {feedback.focusAreas.length > 0 && (
          <div className="mt-4 rounded-xl bg-stone-50 p-4">
            <p className="text-sm font-medium text-stone-800">
              Aree su cui concentrarsi:
            </p>
            <ul className="mt-1 list-inside list-disc text-sm text-stone-600">
              {feedback.focusAreas.map((area) => (
                <li key={area.key}>{area.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {feedback.categories.map((category) => {
          const style = TIER_STYLES[category.tier];
          const percent = Math.round((category.score / category.maxScore) * 100);
          return (
            <div
              key={category.key}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-stone-900">{category.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${style.badge}`}
                >
                  {category.tierLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {category.score} / {category.maxScore} punti
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${style.bar}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-stone-600">{category.advice}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
