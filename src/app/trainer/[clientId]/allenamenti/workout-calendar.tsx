"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock, Dumbbell, CalendarX, Plus, Trash2, Pencil, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { renderZoneTokens, type HeartRateZone } from "@/lib/health-score";
import { MonthCalendar } from "@/components/month-calendar";
import { Tag } from "@/components/ui";
import { toISODate } from "@/lib/dates";
import { upsertWorkoutAssignment, deleteWorkoutAssignment, type WorkoutAssignmentInput } from "./actions";

type Assignment = Tables<"workout_assignments"> & {
  workout_assignment_exercises: Tables<"workout_assignment_exercises">[];
};
type CatalogWorkout = Tables<"workouts"> & { workout_exercises: Tables<"workout_exercises">[] };

interface ExerciseRow {
  key: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

const CATEGORY_CATALOG_LABELS: Record<string, string> = {
  casa: "Casa",
  ripetute: "Ripetute",
  hyrox: "Hyrox",
  mobility: "Mobilità e recupero",
  gym: "Palestra (GYM)",
  corsa: "Corsa",
};

const SUBCATEGORY_CATALOG_LABELS: Record<string, string> = {
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

/** Categorie che hanno il terzo passaggio "Livello" nel selettore a cascata. */
const LEVELED_CATALOG_CATEGORIES = new Set(["gym", "corsa"]);

function emptyRow(): ExerciseRow {
  return { key: crypto.randomUUID(), name: "", sets: "3", reps: "10", rest: "60s" };
}

export function TrainerWorkoutCalendar({
  clientId,
  assignments,
  catalog,
  zones = null,
}: {
  clientId: string;
  assignments: Assignment[];
  catalog: CatalogWorkout[];
  zones?: HeartRateZone[] | null;
}) {
  const byDate = useMemo(() => new Map(assignments.map((a) => [a.date, a])), [assignments]);
  const markedDates = useMemo(() => new Set(assignments.map((a) => a.date)), [assignments]);

  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ExerciseRow[]>([emptyRow()]);

  const [catCategory, setCatCategory] = useState("");
  const [catWorkoutOrSub, setCatWorkoutOrSub] = useState("");
  const [catLevel, setCatLevel] = useState<number | null>(null);

  const catalogCategories = useMemo(() => {
    const present = new Set(catalog.map((w) => w.category));
    return Object.keys(CATEGORY_CATALOG_LABELS).filter((c) => present.has(c));
  }, [catalog]);

  const catalogWorkoutsInCategory = useMemo(
    () => catalog.filter((w) => w.category === catCategory),
    [catalog, catCategory]
  );

  const catIsLeveled = LEVELED_CATALOG_CATEGORIES.has(catCategory);

  const catalogGymSubcategories = useMemo(() => {
    if (!catIsLeveled) return [];
    const present = new Set(
      catalogWorkoutsInCategory.map((w) => w.subcategory).filter((s): s is string => s !== null)
    );
    return Object.keys(SUBCATEGORY_CATALOG_LABELS).filter((s) => present.has(s));
  }, [catIsLeveled, catalogWorkoutsInCategory]);

  const catalogGymLevels = useMemo(
    () =>
      catalogWorkoutsInCategory
        .filter((w) => w.subcategory === catWorkoutOrSub && w.level !== null)
        .map((w) => w.level as number)
        .sort((a, b) => a - b),
    [catalogWorkoutsInCategory, catWorkoutOrSub]
  );

  function resetCatalogPicker() {
    setCatCategory("");
    setCatWorkoutOrSub("");
    setCatLevel(null);
  }

  const assignment = byDate.get(selected) ?? null;

  function selectDay(iso: string) {
    setSelected(iso);
    setEditing(false);
    setError(null);
  }

  function startCreate() {
    setName("");
    setCategory("");
    setDuration("");
    setNotes("");
    setRows([emptyRow()]);
    resetCatalogPicker();
    setError(null);
    setEditing(true);
  }

  function startEdit() {
    if (!assignment) return;
    setName(assignment.name);
    setCategory(assignment.category ?? "");
    setDuration(assignment.duration_minutes !== null ? String(assignment.duration_minutes) : "");
    setNotes(assignment.notes ?? "");
    setRows(
      assignment.workout_assignment_exercises.length > 0
        ? assignment.workout_assignment_exercises.map((ex) => ({
            key: ex.id,
            name: ex.name,
            sets: String(ex.sets),
            reps: ex.reps,
            rest: ex.rest,
          }))
        : [emptyRow()]
    );
    resetCatalogPicker();
    setError(null);
    setEditing(true);
  }

  function applyCatalogPrefill(workoutId: string) {
    const w = catalog.find((c) => c.id === workoutId);
    if (!w) return;
    setName(w.name);
    setCategory(CATEGORY_CATALOG_LABELS[w.category] ?? w.category);
    setDuration(String(w.duration_minutes));
    setRows(
      w.workout_exercises.length > 0
        ? w.workout_exercises.map((ex) => ({
            key: crypto.randomUUID(),
            name: renderZoneTokens(ex.name, zones),
            sets: String(ex.sets),
            reps: ex.reps,
            rest: renderZoneTokens(ex.rest, zones),
          }))
        : [emptyRow()]
    );
  }

  function updateRow(key: string, field: keyof Omit<ExerciseRow, "key">, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function save() {
    const durationNum = duration.trim() ? Number(duration) : null;
    const payload: WorkoutAssignmentInput = {
      name,
      category: category || null,
      duration_minutes: durationNum !== null && Number.isFinite(durationNum) ? durationNum : null,
      notes: notes || null,
      exercises: rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name,
          sets: Number(r.sets) || 0,
          reps: r.reps,
          rest: r.rest,
        })),
    };

    startTransition(async () => {
      const result = await upsertWorkoutAssignment(clientId, selected, payload);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
        setError(null);
      }
    });
  }

  function remove() {
    if (!assignment) return;
    startTransition(async () => {
      await deleteWorkoutAssignment(clientId, assignment.id);
      setEditing(false);
    });
  }

  const selectedLabel = new Date(selected + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[300px_1fr]">
      <div className="rounded-xl border border-line bg-surface p-4">
        <MonthCalendar markedDates={markedDates} selectedDate={selected} onSelectDate={selectDay} />
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gold">
            {selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1)}
          </div>
          {!editing && assignment && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                <Pencil size={12} strokeWidth={2.2} />
                Modifica
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad disabled:opacity-60"
              >
                <Trash2 size={12} strokeWidth={2.2} />
                Elimina
              </button>
            </div>
          )}
        </div>

        {!editing && !assignment && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CalendarX size={22} strokeWidth={1.8} className="text-ink-faint" />
            <p className="text-[12.5px] text-ink-faint">Nessun allenamento assegnato per questo giorno.</p>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
            >
              <Plus size={13} strokeWidth={2.2} />
              Assegna allenamento
            </button>
          </div>
        )}

        {!editing && assignment && (
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

        {editing && (
          <div>
            {catalog.length > 0 && (
              <div className="mb-3.5 rounded-lg border border-line bg-cream p-3">
                <span className="mb-2 block text-xs font-medium text-ink-soft">
                  Parti da un allenamento del catalogo (facoltativo)
                </span>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="catalog-category">
                      Categoria
                    </label>
                    <select
                      id="catalog-category"
                      value={catCategory}
                      onChange={(e) => {
                        setCatCategory(e.target.value);
                        setCatWorkoutOrSub("");
                        setCatLevel(null);
                      }}
                      className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-teal"
                    >
                      <option value="">Scegli…</option>
                      {catalogCategories.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_CATALOG_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="catalog-workout">
                      Allenamento
                    </label>
                    <select
                      id="catalog-workout"
                      value={catWorkoutOrSub}
                      disabled={!catCategory}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCatWorkoutOrSub(value);
                        setCatLevel(null);
                        if (!catIsLeveled && value) applyCatalogPrefill(value);
                      }}
                      className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-teal disabled:opacity-50"
                    >
                      <option value="">Scegli…</option>
                      {catIsLeveled
                        ? catalogGymSubcategories.map((s) => (
                            <option key={s} value={s}>
                              {SUBCATEGORY_CATALOG_LABELS[s]}
                            </option>
                          ))
                        : catalogWorkoutsInCategory.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="catalog-level">
                      Livello
                    </label>
                    <select
                      id="catalog-level"
                      value={catLevel ?? ""}
                      disabled={!catIsLeveled || !catWorkoutOrSub}
                      onChange={(e) => {
                        const lvl = Number(e.target.value);
                        setCatLevel(lvl);
                        const w = catalogWorkoutsInCategory.find(
                          (x) => x.subcategory === catWorkoutOrSub && x.level === lvl
                        );
                        if (w) applyCatalogPrefill(w.id);
                      }}
                      className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-teal disabled:opacity-50"
                    >
                      <option value="">Scegli…</option>
                      {catalogGymLevels.map((l) => (
                        <option key={l} value={l}>
                          Livello {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3.5">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="wa-name">
                Nome allenamento
              </label>
              <input
                id="wa-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Gambe pesanti"
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-3.5 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="wa-category">
                  Categoria (facoltativo)
                </label>
                <input
                  id="wa-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Es. Full body"
                  className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="wa-duration">
                  Durata (min)
                </label>
                <input
                  id="wa-duration"
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="mb-3.5">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="wa-notes">
                Note per il cliente (facoltativo)
              </label>
              <textarea
                id="wa-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-3.5">
              <span className="mb-1.5 block text-xs font-medium text-ink-soft">Esercizi</span>
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div key={r.key} className="grid grid-cols-[1fr_50px_60px_60px_auto] items-center gap-1.5">
                    <input
                      value={r.name}
                      onChange={(e) => updateRow(r.key, "name", e.target.value)}
                      placeholder="Esercizio"
                      className="rounded-md border border-line bg-cream px-2 py-1.5 text-[12.5px] outline-none focus:border-teal"
                    />
                    <input
                      value={r.sets}
                      onChange={(e) => updateRow(r.key, "sets", e.target.value)}
                      placeholder="Serie"
                      inputMode="numeric"
                      className="rounded-md border border-line bg-cream px-1.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
                    />
                    <input
                      value={r.reps}
                      onChange={(e) => updateRow(r.key, "reps", e.target.value)}
                      placeholder="Rip."
                      className="rounded-md border border-line bg-cream px-1.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
                    />
                    <input
                      value={r.rest}
                      onChange={(e) => updateRow(r.key, "rest", e.target.value)}
                      placeholder="Rec."
                      className="rounded-md border border-line bg-cream px-1.5 py-1.5 text-[12.5px] outline-none focus:border-teal"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      aria-label="Rimuovi esercizio"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:text-bad"
                    >
                      <X size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
                className="mt-2 flex items-center gap-1 text-[12px] font-medium text-teal"
              >
                <Plus size={13} strokeWidth={2.2} />
                Aggiungi esercizio
              </button>
            </div>

            {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={save}
                className="rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Salvataggio…" : "Salva allenamento"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
