import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [clientCount, activeClientCount, recipeCount, groupCount, longevityRespondents] =
    await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "CLIENT", isActive: true } }),
      prisma.recipe.count(),
      prisma.substitutionGroup.count(),
      prisma.longevityAssessment.findMany({
        where: { user: { role: "CLIENT" } },
        distinct: ["userId"],
        select: { userId: true },
      }),
    ]);

  const stats = [
    { label: "Clienti totali", value: clientCount, href: "/admin/clients" },
    { label: "Clienti attivi", value: activeClientCount, href: "/admin/clients" },
    {
      label: "Questionari Longevity compilati",
      value: longevityRespondents.length,
      href: "/admin/longevity",
    },
    { label: "Ricette", value: recipeCount, href: "/admin/recipes" },
    { label: "Gruppi di sostituzione", value: groupCount, href: "/admin/substitutions" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Pannello nutrizionista</h1>
        <p className="mt-1 text-stone-600">
          Gestisci clienti, ricette e alimenti sostitutivi del tuo servizio premium.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
          >
            <p className="text-3xl font-semibold text-stone-900">{stat.value}</p>
            <p className="mt-1 text-sm text-stone-600">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
