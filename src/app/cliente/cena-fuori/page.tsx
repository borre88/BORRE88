import { createClient } from "@/lib/supabase/server";
import { CenaTab } from "./cena-tab";

export default async function CenaFuoriPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("dining_categories")
    .select("*, dining_dishes(*)")
    .order("position");

  return <CenaTab categories={categories ?? []} />;
}
