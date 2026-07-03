import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminRecipesPage() {
  const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Ricette</h1>
          <p className="mt-1 text-stone-600">
            Gestisci la libreria di ricette visibile ai clienti attivi.
          </p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Nuova ricetta
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-stone-500">Nessuna ricetta creata ancora.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/admin/recipes/${recipe.id}`}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
            >
              <h2 className="font-semibold text-stone-900">{recipe.title}</h2>
              {recipe.description && (
                <p className="mt-1 text-sm text-stone-600">{recipe.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
