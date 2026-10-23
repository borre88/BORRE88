import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { RecommendationList } from "./recommendation-list";

export default async function RaccomandazioniPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("trainer_id", session!.user.id)
    .order("position")
    .order("title");

  return (
    <div>
      <SectionIntro
        title="Raccomandazioni"
        subtitle="Schede pronte su patologie e condizioni frequenti, da copiare nelle note dei piani alimentari dei tuoi clienti."
      />
      <RecommendationList recommendations={recommendations ?? []} />
    </div>
  );
}
