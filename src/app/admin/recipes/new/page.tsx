import Link from "next/link";
import { createRecipeAction } from "../actions";
import { RecipeForm } from "../recipe-form";

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/recipes" className="text-sm text-emerald-700 hover:underline">
        &larr; Torna alle ricette
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Nuova ricetta</h1>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <RecipeForm action={createRecipeAction} submitLabel="Crea ricetta" />
      </div>
    </div>
  );
}
