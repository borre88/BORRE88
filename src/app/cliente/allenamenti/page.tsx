import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculateAge, calculateHeartRateZones } from "@/lib/health-score";
import { SectionHeader } from "@/components/section-header";
import { AllenamentiTabs } from "./allenamenti-tabs";

export default async function AllenamentiPage() {
  const session = await getSession();
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, date_of_birth")
    .eq("profile_id", session!.user.id)
    .single();

  const { data: latestMeasurement } = client
    ? await supabase
        .from("measurements")
        .select("resting_hr")
        .eq("client_id", client.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const age = client?.date_of_birth ? calculateAge(client.date_of_birth) : null;
  const zones =
    age !== null && latestMeasurement?.resting_hr ? calculateHeartRateZones(age, latestMeasurement.resting_hr) : null;

  const { data: assignments } = client
    ? await supabase
        .from("workout_assignments")
        .select("*, workout_assignment_exercises(*)")
        .eq("client_id", client.id)
        .order("date")
    : { data: null };

  const normalizedAssignments = (assignments ?? []).map((a) => ({
    ...a,
    workout_assignment_exercises: [...a.workout_assignment_exercises].sort((x, y) => x.position - y.position),
  }));

  const { data: libraryRows } = client
    ? await supabase
        .from("client_workout_library")
        .select("workouts(*, workout_exercises(*))")
        .eq("client_id", client.id)
    : { data: null };

  const libraryWorkouts = (libraryRows ?? [])
    .map((r) => r.workouts)
    .filter((w): w is NonNullable<typeof w> => w !== null);

  const normalizedWorkouts = libraryWorkouts
    .map((w) => ({
      ...w,
      workout_exercises: [...w.workout_exercises].sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <SectionHeader title="Allenamenti" />
      <AllenamentiTabs assignments={normalizedAssignments} workouts={normalizedWorkouts} zones={zones} />
    </div>
  );
}
