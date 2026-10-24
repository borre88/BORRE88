import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DietPlanEditor } from "./diet-plan-editor";

export default async function ClientDietePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, trainer_id")
    .eq("id", clientId)
    .single();
  if (!client) notFound();

  const { data: foods } = await supabase.from("foods").select("*").order("category").order("name");

  const { data: supplements } = await supabase
    .from("supplements")
    .select("*")
    .eq("trainer_id", client.trainer_id)
    .order("position")
    .order("name");

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("trainer_id", client.trainer_id)
    .order("position")
    .order("title");

  const { data: recipes } = await supabase.from("recipes").select("*").order("name");

  const { data: protocols } = await supabase
    .from("protocols")
    .select("*")
    .eq("trainer_id", client.trainer_id)
    .order("position")
    .order("title");

  const { data: plans } = await supabase
    .from("diet_plans")
    .select(
      "*, diet_plan_days(*), diet_plan_meals(*, diet_plan_meal_items(*, diet_plan_meal_item_alternatives(*))), diet_plan_recommended_supplements(*)"
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const normalizedPlans = (plans ?? []).map((p) => ({
    ...p,
    diet_plan_meals: [...p.diet_plan_meals].sort((a, b) => a.weekday - b.weekday || a.position - b.position),
  }));

  return (
    <div>
      <Link
        href={`/trainer/${clientId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-teal"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        Torna alla scheda cliente
      </Link>
      <h1 className="mb-4 font-display text-lg font-bold">Diete — {client.full_name}</h1>
      <DietPlanEditor
        clientId={clientId}
        plans={normalizedPlans}
        foods={foods ?? []}
        supplements={supplements ?? []}
        recipes={recipes ?? []}
        recommendations={recommendations ?? []}
        protocols={protocols ?? []}
      />
    </div>
  );
}
