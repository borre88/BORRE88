import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RecipeList } from "./recipe-list";

export default async function RicettePage() {
  const supabase = await createClient();

  const { data: recipes } = await supabase.from("recipes").select("*").order("name");
  const count = recipes?.length ?? 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-[28px] font-bold leading-tight">Ricette</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-faint">
            Il ricettario con kcal e macro già calcolati, visibile anche ai tuoi clienti nella loro area Nutrizione.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-teal-soft-line bg-teal-soft px-3 py-1.5 text-xs font-semibold text-teal">
          <BookOpen size={13} strokeWidth={2.4} />
          {count} {count === 1 ? "ricetta" : "ricette"}
        </span>
      </div>
      <RecipeList recipes={recipes ?? []} />
    </div>
  );
}
