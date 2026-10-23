import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { RecipeList } from "./recipe-list";

export default async function RicettePage() {
  const supabase = await createClient();

  const { data: recipes } = await supabase.from("recipes").select("*").order("name");

  return (
    <div>
      <SectionIntro
        title="Ricette"
        subtitle="Il ricettario con kcal e macro già calcolati, visibile anche ai tuoi clienti nella loro area Nutrizione."
      />
      <RecipeList recipes={recipes ?? []} />
    </div>
  );
}
