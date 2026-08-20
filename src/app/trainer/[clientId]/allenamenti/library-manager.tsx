"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Clock, Dumbbell, Plus, Minus } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { ChipGroup, Tag } from "@/components/ui";
import { setClientLibraryWorkouts } from "./actions";

type CatalogWorkout = Tables<"workouts"> & { workout_exercises: Tables<"workout_exercises">[] };

const CATEGORY_LABELS: Record<string, string> = {
  casa: "Casa",
  ripetute: "Ripetute",
  hyrox: "Hyrox",
  mobility: "Mobilità e recupero",
  gym: "Palestra (GYM)",
  corsa: "Corsa",
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  leg: "Leg",
  leg_focus_quad: "Leg Focus Quadricipiti",
  leg_focus_femorali: "Leg Focus Femorali",
  leg_focus_glutei: "Leg Focus Glutei",
  full_body: "Full Body",
  full_body_restart: "Full Body Restart",
  zona2: "Corsa Zona 2",
  intervalli: "Ripetute Zona 3/4",
  soglia: "Soglia",
  fartlek: "Fartlek",
};

const LEVELED_CATEGORIES = new Set(["gym", "corsa"]);

export function LibraryManager({
  clientId,
  catalog,
  initialAssignedIds,
}: {
  clientId: string;
  catalog: CatalogWorkout[];
  initialAssignedIds: string[];
}) {
  const [assignedIds, setAssignedIds] = useState(() => new Set(initialAssignedIds));
  const [pending, startTransition] = useTransition();

  const categories = useMemo(() => {
    const present = new Set(catalog.map((w) => w.category));
    return Object.keys(CATEGORY_LABELS).filter((c) => present.has(c));
  }, [catalog]);

  const [category, setCategory] = useState(categories[0] ?? "casa");
  const inCategory = useMemo(() => catalog.filter((w) => w.category === category), [catalog, category]);

  const isLeveled = LEVELED_CATEGORIES.has(category);
  const subcategories = useMemo(() => {
    const present = new Set(inCategory.map((w) => w.subcategory).filter((s): s is string => s !== null));
    return Object.keys(SUBCATEGORY_LABELS).filter((s) => present.has(s));
  }, [inCategory]);

  const [subcategory, setSubcategory] = useState(subcategories[0] ?? "");
  const [level, setLevel] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!isLeveled) return inCategory;
    return inCategory.filter((w) => w.subcategory === (subcategory || subcategories[0]) && (level === null || w.level === level));
  }, [inCategory, isLeveled, subcategory, subcategories, level]);

  const allFilteredAssigned = filtered.length > 0 && filtered.every((w) => assignedIds.has(w.id));

  function toggle(workoutId: string) {
    const enabled = !assignedIds.has(workoutId);
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (enabled) next.add(workoutId);
      else next.delete(workoutId);
      return next;
    });
    startTransition(async () => {
      await setClientLibraryWorkouts(clientId, [workoutId], enabled);
    });
  }

  function bulkSet(enabled: boolean) {
    const ids = filtered.map((w) => w.id);
    if (ids.length === 0) return;
    setAssignedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (enabled) next.add(id);
        else next.delete(id);
      }
      return next;
    });
    startTransition(async () => {
      await setClientLibraryWorkouts(clientId, ids, enabled);
    });
  }

  return (
    <div>
      <p className="mb-4 text-[12.5px] text-ink-faint">
        Scegli quali allenamenti del catalogo il cliente vede nella sua "Workout list". Tu vedi sempre tutto il
        catalogo qui e nel selettore del calendario.
      </p>

      <div className="mb-3">
        <ChipGroup
          value={category}
          onChange={(v) => {
            setCategory(v);
            setSubcategory("");
            setLevel(null);
          }}
          options={categories.map((c) => ({ key: c, label: CATEGORY_LABELS[c] }))}
        />
      </div>

      {isLeveled && (
        <>
          <div className="mb-2.5">
            <ChipGroup
              value={subcategory || subcategories[0] || ""}
              onChange={(v) => {
                setSubcategory(v);
                setLevel(null);
              }}
              options={subcategories.map((s) => ({ key: s, label: SUBCATEGORY_LABELS[s] }))}
            />
          </div>
          <div className="mb-3">
            <ChipGroup
              value={level === null ? "tutti" : String(level)}
              onChange={(v) => setLevel(v === "tutti" ? null : Number(v))}
              options={[
                { key: "tutti", label: "Tutti i livelli" },
                ...[1, 2, 3, 4, 5].map((l) => ({ key: String(l), label: `Livello ${l}` })),
              ]}
            />
          </div>
        </>
      )}

      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span className="text-[11.5px] text-ink-faint">{filtered.length} allenamenti in questa vista</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={pending || filtered.length === 0}
            onClick={() => bulkSet(true)}
            className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal disabled:opacity-50"
          >
            <Plus size={12} strokeWidth={2.2} />
            Aggiungi tutti i visibili
          </button>
          <button
            type="button"
            disabled={pending || filtered.length === 0 || !allFilteredAssigned}
            onClick={() => bulkSet(false)}
            className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad disabled:opacity-50"
          >
            <Minus size={12} strokeWidth={2.2} />
            Rimuovi tutti i visibili
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {filtered.map((w) => {
          const assigned = assignedIds.has(w.id);
          return (
            <div
              key={w.id}
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${
                assigned ? "border-teal bg-teal-soft" : "border-line bg-surface"
              }`}
            >
              <div className="flex-1">
                <div className="mb-1.5 flex gap-1.5">
                  {isLeveled && w.level !== null && <Tag>Livello {w.level}</Tag>}
                  <Tag muted>{w.goal}</Tag>
                </div>
                <div className="mb-1 text-[13.5px] font-medium leading-tight">{w.name}</div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Clock size={12} strokeWidth={2.2} /> {w.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-soft">
                    <Dumbbell size={12} strokeWidth={2.2} /> {w.workout_exercises.length} esercizi
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => toggle(w.id)}
                aria-label={assigned ? "Rimuovi dalla libreria del cliente" : "Aggiungi alla libreria del cliente"}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border disabled:opacity-50 ${
                  assigned ? "border-teal bg-teal text-white" : "border-line bg-cream text-ink-faint"
                }`}
              >
                {assigned ? <Check size={15} strokeWidth={2.4} /> : <Plus size={15} strokeWidth={2.4} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
