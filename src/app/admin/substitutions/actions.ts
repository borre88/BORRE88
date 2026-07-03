"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type GroupFormState = {
  error?: string;
};

export async function createGroupAction(
  _prevState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Il nome del gruppo è obbligatorio." };
  }

  const group = await prisma.substitutionGroup.create({
    data: { name, description: description || null },
  });

  revalidatePath("/admin/substitutions");
  redirect(`/admin/substitutions/${group.id}`);
}

export async function updateGroupAction(
  groupId: string,
  _prevState: GroupFormState,
  formData: FormData,
): Promise<GroupFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Il nome del gruppo è obbligatorio." };
  }

  await prisma.substitutionGroup.update({
    where: { id: groupId },
    data: { name, description: description || null },
  });

  revalidatePath("/admin/substitutions");
  revalidatePath(`/admin/substitutions/${groupId}`);
  revalidatePath("/dashboard/substitutions");
  return {};
}

export async function deleteGroupAction(groupId: string) {
  await prisma.substitutionGroup.delete({ where: { id: groupId } });
  revalidatePath("/admin/substitutions");
  revalidatePath("/dashboard/substitutions");
  redirect("/admin/substitutions");
}

export type ItemFormState = {
  error?: string;
};

export async function addItemAction(
  groupId: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !quantity) {
    return { error: "Nome e quantità dell'alimento sono obbligatori." };
  }

  await prisma.foodItem.create({
    data: { name, quantity, notes: notes || null, groupId },
  });

  revalidatePath(`/admin/substitutions/${groupId}`);
  revalidatePath("/dashboard/substitutions");
  return {};
}

export async function deleteItemAction(groupId: string, itemId: string) {
  await prisma.foodItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/substitutions/${groupId}`);
  revalidatePath("/dashboard/substitutions");
}
