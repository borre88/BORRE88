import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { DeliveryTab } from "./delivery-tab";

export default async function DeliveryPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", session!.user.id)
    .single();

  const { data: latestRequest } = client
    ? await supabase
        .from("delivery_requests")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return <DeliveryTab hasClient={!!client} latestRequest={latestRequest ?? null} />;
}
