import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deleteRecipeAction, updateRecipeAction } from "../actions";
import { RecipeForm } from "../recipe-form";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) notFound();

  const boundUpdate = updateRecipeAction.bind(null, recipe.id);
  const boundDelete = deleteRecipeAction.bind(null, recipe.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/recipes" className="text-sm text-emerald-700 hover:underline">
        &larr; Torna alle ricette
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{recipe.title}</h1>
        <form action={boundDelete}>
          <ConfirmSubmitButton
            confirmMessage={`Eliminare la ricetta "${recipe.title}"?`}
            className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Elimina ricetta
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <RecipeForm
          action={boundUpdate}
          submitLabel="Salva modifiche"
          defaultValues={{
            title: recipe.title,
            description: recipe.description ?? "",
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            calories: recipe.calories?.toString() ?? "",
            tags: recipe.tags ?? "",
          }}
        />
      </div>
    </div>
  );
}
