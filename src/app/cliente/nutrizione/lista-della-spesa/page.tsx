import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { ListaSpesaTab } from "./lista-spesa-tab";

export default async function ListaSpesaPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", session!.user.id)
    .single();

  const { data: items } = client
    ? await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  return <ListaSpesaTab items={items ?? []} />;
}
