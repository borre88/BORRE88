import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ClientRecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id } });

  if (!recipe) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/recipes" className="text-sm text-emerald-700 hover:underline">
        &larr; Torna alle ricette
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{recipe.title}</h1>
        {recipe.description && (
          <p className="mt-1 text-stone-600">{recipe.description}</p>
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900">Ingredienti</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {recipe.ingredients.split("\n").filter(Boolean).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900">Preparazione</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {recipe.instructions.split("\n").filter(Boolean).map((line, i) => (
              <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
