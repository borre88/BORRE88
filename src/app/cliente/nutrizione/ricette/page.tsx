import { createClient } from "@/lib/supabase/server";
import { RicetteTab } from "./ricette-tab";

export default async function RicettePage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase.from("recipes").select("*").order("name");

  return <RicetteTab recipes={recipes ?? []} />;
}
