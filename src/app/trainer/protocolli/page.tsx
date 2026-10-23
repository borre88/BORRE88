import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { ProtocolList } from "./protocol-list";

export default async function ProtocolliPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: protocols } = await supabase
    .from("protocols")
    .select("*")
    .eq("trainer_id", session!.user.id)
    .order("position")
    .order("title");

  return (
    <div>
      <SectionIntro
        title="Protocolli"
        subtitle="Combinazioni di integratori già pronte per obiettivi e condizioni ricorrenti, da proporre rapidamente ai clienti."
      />
      <ProtocolList protocols={protocols ?? []} />
    </div>
  );
}
