import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { SectionHeader } from "@/components/section-header";
import { IntegrazioniTab } from "./integrazioni-tab";

export default async function IntegrazioniPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, trainer_id")
    .eq("profile_id", session!.user.id)
    .single();

  const [{ data: latestRequest }, { data: supplements }] = await Promise.all([
    client
      ? supabase
          .from("supplement_requests")
          .select("*")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    client
      ? supabase.from("supplements").select("*").eq("trainer_id", client.trainer_id).order("position").order("name")
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div>
      <SectionHeader title="Integrazioni" />
      <IntegrazioniTab hasClient={!!client} latestRequest={latestRequest ?? null} supplements={supplements ?? []} />
    </div>
  );
}
