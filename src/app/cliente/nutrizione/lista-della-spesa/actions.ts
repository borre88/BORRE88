"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/cliente/nutrizione/lista-della-spesa";

async function getClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).single();
  return client?.id ?? null;
}

export interface ShoppingActionState {
  error?: string;
}

export async function addShoppingItem(
  _prevState: ShoppingActionState | undefined,
  formData: FormData
): Promise<ShoppingActionState> {
  const supabase = await createClient();
  const clientId = await getClientId(supabase);
  if (!clientId) return { error: "Nessuna scheda cliente collegata al tuo account." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return {};

  const { error } = await supabase.from("shopping_list_items").insert({ client_id: clientId, name });
  if (error) return { error: "Impossibile aggiungere l'elemento." };

  revalidatePath(PATH);
  return {};
}

export async function addItemsToShoppingList(items: string[]): Promise<ShoppingActionState> {
  const supabase = await createClient();
  const clientId = await getClientId(supabase);
  if (!clientId) return { error: "Nessuna scheda cliente collegata al tuo account." };

  const rows = items.map((name) => ({ client_id: clientId, name }));
  if (rows.length === 0) return {};

  const { error } = await supabase.from("shopping_list_items").insert(rows);
  if (error) return { error: "Impossibile aggiungere gli ingredienti." };

  revalidatePath(PATH);
  return {};
}

export async function toggleShoppingItem(id: string, checked: boolean) {
  const supabase = await createClient();
  await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  revalidatePath(PATH);
}

export async function deleteShoppingItem(id: string) {
  const supabase = await createClient();
  await supabase.from("shopping_list_items").delete().eq("id", id);
  revalidatePath(PATH);
}

export async function clearCheckedItems() {
  const supabase = await createClient();
  const clientId = await getClientId(supabase);
  if (!clientId) return;
  await supabase.from("shopping_list_items").delete().eq("client_id", clientId).eq("checked", true);
  revalidatePath(PATH);
}
