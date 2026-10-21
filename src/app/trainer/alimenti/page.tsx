import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { FoodList } from "./food-list";

export default async function AlimentiPage() {
  const supabase = await createClient();
  const { data: foods } = await supabase.from("foods").select("*").order("category").order("name");

  return (
    <div>
      <SectionIntro
        title="Database Alimenti"
        subtitle="La base per costruire le diete: cerca, aggiungi o importa alimenti con i relativi valori nutrizionali per 100g."
      />
      <FoodList foods={foods ?? []} />
    </div>
  );
}
