import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, calculateHeartRateZones } from "@/lib/health-score";
import { AreaTabs } from "@/components/area-tabs";
import { TrainerWorkoutCalendar } from "./workout-calendar";
import { LibraryManager } from "./library-manager";

export default async function ClientAllenamentiPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, date_of_birth")
    .eq("id", clientId)
    .single();
  if (!client) notFound();

  const { data: latestMeasurement } = await supabase
    .from("measurements")
    .select("resting_hr")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null;
  const zones =
    age !== null && latestMeasurement?.resting_hr ? calculateHeartRateZones(age, latestMeasurement.resting_hr) : null;

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

  const { data: libraryRows } = await supabase
    .from("client_workout_library")
    .select("workout_id")
    .eq("client_id", clientId);

  const assignedWorkoutIds = (libraryRows ?? []).map((r) => r.workout_id);

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
      <AreaTabs
        tabs={[
          {
            key: "calendario",
            label: "Calendario",
            content: (
              <TrainerWorkoutCalendar
                clientId={clientId}
                assignments={normalizedAssignments}
                catalog={normalizedCatalog}
                zones={zones}
              />
            ),
          },
          {
            key: "libreria",
            label: "Libreria cliente",
            content: (
              <LibraryManager clientId={clientId} catalog={normalizedCatalog} initialAssignedIds={assignedWorkoutIds} />
            ),
          },
        ]}
      />
    </div>
  );
}
