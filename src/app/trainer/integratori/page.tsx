import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { SupplementList } from "./supplement-list";

export default async function IntegratoriPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: supplements } = await supabase
    .from("supplements")
    .select("*")
    .eq("trainer_id", session!.user.id)
    .order("position")
    .order("name");

  return (
    <div>
      <SectionIntro
        title="Integratori"
        subtitle="Il catalogo prodotti da proporre ai tuoi clienti, in collaborazione con Mowe Nutrition."
      />
      <SupplementList supplements={supplements ?? []} />
    </div>
  );
}
