import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TrainerWorkoutCalendar } from "./workout-calendar";

export default async function ClientAllenamentiPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("id, full_name").eq("id", clientId).single();
  if (!client) notFound();

  const { data: assignments } = await supabase
    .from("workout_assignments")
    .select("*, workout_assignment_exercises(*)")
    .eq("client_id", clientId)
    .order("date");

  const normalizedAssignments = (assignments ?? []).map((a) => ({
    ...a,
    workout_assignment_exercises: [...a.workout_assignment_exercises].sort((x, y) => x.position - y.position),
  }));

  const { data: catalog } = await supabase.from("workouts").select("*, workout_exercises(*)").order("name");

  const normalizedCatalog = (catalog ?? []).map((w) => ({
    ...w,
    workout_exercises: [...w.workout_exercises].sort((a, b) => a.position - b.position),
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
      <h1 className="mb-4 font-display text-lg font-bold">Allenamenti — {client.full_name}</h1>
      <TrainerWorkoutCalendar clientId={clientId} assignments={normalizedAssignments} catalog={normalizedCatalog} />
    </div>
  );
}
