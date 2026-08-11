import { createClient } from "@/lib/supabase/server";
import { SectionHeader } from "@/components/section-header";
import { AllenamentiTab } from "./allenamenti-tab";

export default async function AllenamentiPage() {
  const supabase = await createClient();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*, workout_exercises(*)")
    .order("name");

  const normalized = (workouts ?? []).map((w) => ({
    ...w,
    workout_exercises: [...w.workout_exercises].sort((a, b) => a.position - b.position),
  }));

  return (
    <div>
      <SectionHeader title="Allenamenti" />
      <AllenamentiTab workouts={normalized} />
    </div>
  );
}
