import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, type Gender } from "@/lib/health-score";
import { PianificazioneEditor } from "./pianificazione-editor";

export default async function ClientPianificazionePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth, gender, trainer_id")
    .eq("id", clientId)
    .single();
  if (!client) notFound();

  const { data: latestMeasurement } = await supabase
    .from("measurements")
    .select("weight_kg, height_cm, activity_level, body_fat_percent, date")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("trainer_id", client.trainer_id)
    .order("position")
    .order("title");

  const { data: plans } = await supabase
    .from("diet_plans")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  const { data: templates } = await supabase
    .from("diet_plans")
    .select("id, name, phase, duration_weeks, macro_only, target_kcal, target_protein_g, target_carbs_g, target_fat_g")
    .eq("is_template", true)
    .eq("trainer_id", client.trainer_id)
    .order("created_at", { ascending: false });

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
      <h1 className="mb-4 font-display text-lg font-bold">Pianificazione — {client.full_name}</h1>
      <PianificazioneEditor
        clientId={clientId}
        plans={plans ?? []}
        templates={templates ?? []}
        recommendations={recommendations ?? []}
        weightKg={latestMeasurement?.weight_kg ?? null}
        heightCm={latestMeasurement?.height_cm ?? null}
        defaultActivityLevel={latestMeasurement?.activity_level ?? null}
        bodyFatPercent={latestMeasurement?.body_fat_percent ?? null}
        measurementDate={latestMeasurement?.date ?? null}
        age={age}
        gender={gender}
      />
    </div>
  );
}
