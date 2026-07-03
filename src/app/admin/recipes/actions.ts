"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RecipeFormState = {
  error?: string;
};

function readRecipeForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ingredients = String(formData.get("ingredients") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const caloriesRaw = String(formData.get("calories") ?? "").trim();
  const tags = String(formData.get("tags") ?? "").trim();

  return {
    title,
    description: description || null,
    ingredients,
    instructions,
    calories: caloriesRaw ? Number.parseInt(caloriesRaw, 10) : null,
    tags: tags || null,
  };
}

export async function createRecipeAction(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const data = readRecipeForm(formData);

  if (!data.title || !data.ingredients || !data.instructions) {
    return { error: "Titolo, ingredienti e preparazione sono obbligatori." };
  }

  const recipe = await prisma.recipe.create({ data });
  revalidatePath("/admin/recipes");
  revalidatePath("/dashboard/recipes");
  redirect(`/admin/recipes/${recipe.id}`);
}

export async function updateRecipeAction(
  recipeId: string,
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const data = readRecipeForm(formData);

  if (!data.title || !data.ingredients || !data.instructions) {
    return { error: "Titolo, ingredienti e preparazione sono obbligatori." };
  }

  await prisma.recipe.update({ where: { id: recipeId }, data });
  revalidatePath("/admin/recipes");
  revalidatePath(`/admin/recipes/${recipeId}`);
  revalidatePath("/dashboard/recipes");
  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return {};
}

export async function deleteRecipeAction(recipeId: string) {
  await prisma.recipe.delete({ where: { id: recipeId } });
  revalidatePath("/admin/recipes");
  revalidatePath("/dashboard/recipes");
  redirect("/admin/recipes");
}
