"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

const PATH = "/trainer/protocolli";

export interface ProtocolItemInput {
  name: string;
  note: string | null;
}

export interface ProtocolInput {
  title: string;
  description: string | null;
  items: ProtocolItemInput[];
}

export async function createProtocol(input: ProtocolInput) {
  const session = await getSession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("protocols")
    .insert({ ...input, items: input.items as unknown as Json, trainer_id: session!.user.id })
    .select("id")
    .single();

  if (error) return { error: "Impossibile creare il protocollo." };

  revalidatePath(PATH);
  return { protocolId: data.id };
}

export async function updateProtocol(id: string, input: ProtocolInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("protocols")
    .update({ ...input, items: input.items as unknown as Json })
    .eq("id", id);

  if (error) return { error: "Impossibile salvare le modifiche." };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteProtocol(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("protocols").delete().eq("id", id);

  if (error) return { error: "Impossibile eliminare il protocollo." };

  revalidatePath(PATH);
  return { success: true };
}
