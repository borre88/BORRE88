import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { DietPlanEditor } from "./diet-plan-editor";

export default async function ClientDietePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender")
    .eq("id", clientId)
    .single();
  if (!client) notFound();

  const { data: latestMeasurement } = await supabase
    .from("measurements")
    .select("weight_kg, height_cm, activity_level")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: foods } = await supabase.from("foods").select("*").order("category").order("name");

  const { data: plans } = await supabase
    .from("diet_plans")
    .select("*, diet_plan_days(*), diet_plan_meals(*, diet_plan_meal_items(*))")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const normalizedPlans = (plans ?? []).map((p) => ({
    ...p,
    diet_plan_meals: [...p.diet_plan_meals].sort((a, b) => a.weekday - b.weekday || a.position - b.position),
  }));

  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
  const gender = (client.gender as Gender | null) ?? null;

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
        latestMeasurement={latestMeasurement ?? null}
        age={age}
        gender={gender}
      />
    </div>
  );
}
