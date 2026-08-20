"use client";

import type { Tables } from "@/lib/database.types";
import type { HeartRateZone } from "@/lib/health-score";
import { AreaTabs } from "@/components/area-tabs";
import { CalendarView } from "./calendar-view";
import { AllenamentiTab } from "./allenamenti-tab";

type Assignment = Tables<"workout_assignments"> & {
  workout_assignment_exercises: Tables<"workout_assignment_exercises">[];
};
type Workout = Tables<"workouts"> & { workout_exercises: Tables<"workout_exercises">[] };

export function AllenamentiTabs({
  assignments,
  workouts,
  zones,
}: {
  assignments: Assignment[];
  workouts: Workout[];
  zones: HeartRateZone[] | null;
}) {
  return (
    <AreaTabs
      tabs={[
        { key: "calendario", label: "Calendario", content: <CalendarView assignments={assignments} /> },
        {
          key: "holiday",
          label: "Workout list",
          content: <AllenamentiTab workouts={workouts} zones={zones} />,
        },
      ]}
    />
  );
}
