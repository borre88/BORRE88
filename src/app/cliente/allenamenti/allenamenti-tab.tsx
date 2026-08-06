"use client";

import { useMemo, useState } from "react";
import { Clock, Dumbbell, Home, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { ChipGroup, SectionIntro, Tag } from "@/components/ui";

type Workout = Tables<"workouts"> & { workout_exercises: Tables<"workout_exercises">[] };

const EQUIP_LABELS: Record<string, string> = {
  nessuno: "Nessun attrezzo",
  manubri: "Manubri",
  elastici: "Elastici",
};

const GOAL_LABELS: Record<string, string> = {
  generale: "Generale",
  forza: "Forza",
  dimagrimento: "Dimagrimento",
};

export function AllenamentiTab({ workouts }: { workouts: Workout[] }) {
  const [equipment, setEquipment] = useState("tutti");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => workouts.filter((w) => equipment === "tutti" || w.equipment === equipment),
    [workouts, equipment]
  );

  return (
    <div>
      <SectionIntro
        title="Allenamenti a casa"
        subtitle="Schede pronte in base agli attrezzi che hai a disposizione."
      />

      <div className="mb-4">
        <ChipGroup
          value={equipment}
          onChange={setEquipment}
          options={[{ key: "tutti", label: "Tutti" }, ...Object.entries(EQUIP_LABELS).map(([key, label]) => ({ key, label }))]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((w) => (
          <div key={w.id} className="overflow-hidden rounded-xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => setExpanded(expanded === w.id ? null : w.id)}
              className="flex w-full items-start gap-2 px-4 py-3.5 text-left"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex gap-1.5">
                  <Tag>
                    <Home size={10} strokeWidth={2.5} className="mr-1 inline" />
                    {EQUIP_LABELS[w.equipment]}
                  </Tag>
                  <Tag muted>{GOAL_LABELS[w.goal]}</Tag>
                </div>
                <div className="mb-1.5 font-display text-[17px] font-semibold leading-tight">{w.name}</div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Clock size={12} strokeWidth={2.2} /> {w.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Dumbbell size={12} strokeWidth={2.2} /> {w.workout_exercises.length} esercizi
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-ink-faint">
                {expanded === w.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {expanded === w.id && (
              <div className="border-t border-line bg-cream px-4 pb-4 pt-3">
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
                    {w.workout_exercises.map((ex) => (
                      <tr key={ex.id}>
                        <td className="border-t border-line px-2 py-1.5">{ex.name}</td>
                        <td className="border-t border-line px-2 py-1.5">{ex.sets}</td>
                        <td className="border-t border-line px-2 py-1.5">{ex.reps}</td>
                        <td className="border-t border-line px-2 py-1.5">{ex.rest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
