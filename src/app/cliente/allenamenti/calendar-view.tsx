"use client";

import { useMemo, useState } from "react";
import { Clock, Dumbbell, CalendarX } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { MonthCalendar } from "@/components/month-calendar";
import { Tag } from "@/components/ui";
import { toISODate } from "@/lib/dates";

type Assignment = Tables<"workout_assignments"> & {
  workout_assignment_exercises: Tables<"workout_assignment_exercises">[];
};

export function CalendarView({ assignments }: { assignments: Assignment[] }) {
  const byDate = useMemo(() => new Map(assignments.map((a) => [a.date, a])), [assignments]);
  const markedDates = useMemo(() => new Set(assignments.map((a) => a.date)), [assignments]);

  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const assignment = byDate.get(selected) ?? null;

  const selectedLabel = new Date(selected + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[300px_1fr]">
      <div className="rounded-xl border border-line bg-surface p-4">
        <MonthCalendar markedDates={markedDates} selectedDate={selected} onSelectDate={setSelected} />
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gold">
          {selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1)}
        </div>

        {!assignment ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarX size={22} strokeWidth={1.8} className="text-ink-faint" />
            <p className="max-w-[220px] text-[12.5px] text-ink-faint">
              Nessun allenamento assegnato per questo giorno. Chiedi al tuo trainer di caricartelo.
            </p>
          </div>
        ) : (
          <div>
            {assignment.category && <Tag muted>{assignment.category}</Tag>}
            <div className="mb-1.5 mt-1.5 font-display text-[18px] font-semibold leading-tight">
              {assignment.name}
            </div>
            <div className="mb-3 flex flex-wrap gap-3">
              {assignment.duration_minutes !== null && (
                <span className="flex items-center gap-1 text-xs text-ink-soft">
                  <Clock size={12} strokeWidth={2.2} /> {assignment.duration_minutes} min
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <Dumbbell size={12} strokeWidth={2.2} /> {assignment.workout_assignment_exercises.length} esercizi
              </span>
            </div>
            {assignment.notes && (
              <p className="mb-3 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft">
                {assignment.notes}
              </p>
            )}

            {assignment.workout_assignment_exercises.length > 0 && (
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Esercizio</th>
                    <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Serie</th>
                    <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Rip.</th>
                    <th className="px-2 py-1 text-left text-[10.5px] font-semibold text-ink-faint">Recupero</th>
                  </tr>
                </thead>
                <tbody>
                  {assignment.workout_assignment_exercises.map((ex) => (
                    <tr key={ex.id}>
                      <td className="border-t border-line px-2 py-1.5">{ex.name}</td>
                      <td className="border-t border-line px-2 py-1.5">{ex.sets}</td>
                      <td className="border-t border-line px-2 py-1.5">{ex.reps}</td>
                      <td className="border-t border-line px-2 py-1.5">{ex.rest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
