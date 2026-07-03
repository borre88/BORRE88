import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClientRecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Ricette</h1>
        <p className="mt-1 text-stone-600">
          Ricette pensate per accompagnare il tuo piano alimentare.
        </p>
      </div>

      {recipes.length === 0 ? (
        <p className="text-stone-500">Nessuna ricetta disponibile al momento.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/dashboard/recipes/${recipe.id}`}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
            >
              <h2 className="font-semibold text-stone-900">{recipe.title}</h2>
              {recipe.description && (
                <p className="mt-1 text-sm text-stone-600">{recipe.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                {recipe.calories && <span>{recipe.calories} kcal</span>}
                {recipe.tags &&
                  recipe.tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
