import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionIntro } from "@/components/ui";
import { TemplateEditor } from "./template-editor";

export default async function ModelliAlimentariPage() {
  const session = await getSession();
  const supabase = await createClient();

  const [{ data: templates }, { data: foods }, { data: clients }, { data: supplements }, { data: recommendations }] =
    await Promise.all([
      supabase
        .from("diet_plans")
        .select("*, diet_plan_days(*), diet_plan_meals(*, diet_plan_meal_items(*))")
        .eq("is_template", true)
        .eq("trainer_id", session!.user.id)
        .order("created_at", { ascending: false }),
      supabase.from("foods").select("*").order("category").order("name"),
      supabase.from("clients").select("id, full_name").eq("trainer_id", session!.user.id).order("full_name"),
      supabase.from("supplements").select("*").eq("trainer_id", session!.user.id).order("position").order("name"),
      supabase.from("recommendations").select("*").eq("trainer_id", session!.user.id).order("position").order("title"),
    ]);

  const normalizedTemplates = (templates ?? []).map((t) => ({
    ...t,
    diet_plan_meals: [...t.diet_plan_meals].sort((a, b) => a.weekday - b.weekday || a.position - b.position),
  }));

  return (
    <div>
      <SectionIntro
        title="Modelli alimentari"
        subtitle="Diete già pronte da riusare: creale una volta e assegnale con un click ai tuoi clienti."
      />
      <TemplateEditor
        templates={normalizedTemplates}
        foods={foods ?? []}
        clients={clients ?? []}
        supplements={supplements ?? []}
        recommendations={recommendations ?? []}
      />
    </div>
  );
}
