import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tierForTotalScore, tierLabel } from "@/lib/longevity/feedback";

const TIER_BADGE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  improve: "bg-amber-50 text-amber-800 border-amber-200",
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  excellent: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default async function AdminLongevityPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { name: "asc" },
    include: {
      longevityAssessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const withScore = clients.filter((c) => c.longevityAssessments.length > 0);
  const withoutScore = clients.filter((c) => c.longevityAssessments.length === 0);
  const sorted = [
    ...withScore.sort(
      (a, b) => a.longevityAssessments[0].totalScore - b.longevityAssessments[0].totalScore,
    ),
    ...withoutScore,
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Longevity Score</h1>
        <p className="mt-1 text-stone-600">
          Panoramica del punteggio di longevità di tutti i clienti, dal più
          critico al più in forma.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Punteggio</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Ultimo aggiornamento</th>
              <th className="px-4 py-3 font-medium">Dettaglio</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  Nessun cliente ancora registrato.
                </td>
              </tr>
            )}
            {sorted.map((client) => {
              const latest = client.longevityAssessments[0];
              const tier = latest ? tierForTotalScore(latest.totalScore) : null;
              return (
                <tr key={client.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-stone-900">{client.name}</p>
                    <p className="text-xs text-stone-500">{client.email}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-900">
                    {latest ? `${latest.totalScore} / 100` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {tier ? (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TIER_BADGE[tier]}`}
                      >
                        {tierLabel(tier)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                        Nessun questionario
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {latest
                      ? latest.createdAt.toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/longevity/${client.id}`}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Vedi dettaglio
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
