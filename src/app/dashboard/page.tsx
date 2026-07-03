import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  const [recipeCount, groupCount] = await Promise.all([
    prisma.recipe.count(),
    prisma.substitutionGroup.count(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Ciao, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-stone-600">
          Benvenuto nella tua area riservata. Qui trovi ricette e alimenti
          sostitutivi pensati per il tuo percorso.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/recipes"
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
        >
          <h2 className="font-semibold text-stone-900">Ricette</h2>
          <p className="mt-1 text-sm text-stone-600">
            {recipeCount} ricette disponibili
          </p>
        </Link>
        <Link
          href="/dashboard/substitutions"
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
        >
          <h2 className="font-semibold text-stone-900">Alimenti sostitutivi</h2>
          <p className="mt-1 text-sm text-stone-600">
            {groupCount} gruppi di sostituzione
          </p>
        </Link>
      </div>
    </div>
  );
}
