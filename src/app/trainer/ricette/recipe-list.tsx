"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Flame, Clock, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { ChipGroup, EmptyState, MacroPill, Tag } from "@/components/ui";
import { GOAL_LABELS, MEAL_LABELS, TAG_LABELS } from "@/lib/recipes";
import { deleteRecipe } from "./actions";
import { RecipeForm } from "./recipe-form";

type Recipe = Tables<"recipes">;

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [goal, setGoal] = useState("tutti");
  const [meal, setMeal] = useState("tutti");
  const [tags, setTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleTag(key: string) {
    setTags((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]));
  }

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (goal !== "tutti" && r.goal !== goal) return false;
      if (meal !== "tutti" && r.meal !== meal) return false;
      if (tags.length > 0 && !tags.every((t) => r.tags.includes(t))) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [recipes, goal, meal, tags, query]);

  if (mode === "new") {
    return (
      <RecipeForm
        recipe={null}
        onDone={() => setMode("view")}
        onCancel={() => setMode("view")}
      />
    );
  }

  if (mode === "edit" && editing) {
    return <RecipeForm recipe={editing} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="flex max-w-xs flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
          <Search size={14} strokeWidth={2} className="text-ink-faint" />
          <input
            placeholder="Cerca una ricetta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-none bg-transparent text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setMode("new")}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={13} strokeWidth={2.2} />
          Nuova ricetta
        </button>
      </div>

      <p className="mb-2 text-[11.5px] text-ink-faint">
        {filtered.length} {filtered.length === 1 ? "ricetta trovata" : "ricette trovate"}
        {filtered.length !== recipes.length ? ` su ${recipes.length}` : ""}
      </p>

      <div className="mb-2">
        <ChipGroup
          value={goal}
          onChange={setGoal}
          options={[{ key: "tutti", label: "Tutti" }, ...Object.entries(GOAL_LABELS).map(([key, label]) => ({ key, label }))]}
        />
      </div>
      <div className="mb-2">
        <ChipGroup
          value={meal}
          onChange={setMeal}
          options={[{ key: "tutti", label: "Tutti i pasti" }, ...Object.entries(MEAL_LABELS).map(([key, label]) => ({ key, label }))]}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {Object.entries(TAG_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleTag(key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              tags.includes(key) ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Nessuna ricetta trovata con questi filtri." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <button
                type="button"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="flex w-full items-start gap-2 px-4 py-3.5 text-left"
              >
                <div className="flex-1">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    <Tag>{MEAL_LABELS[r.meal] ?? r.meal}</Tag>
                    <Tag muted>{GOAL_LABELS[r.goal] ?? r.goal}</Tag>
                    {r.tags.map((t) => (
                      <Tag key={t} muted>
                        {TAG_LABELS[t] ?? t}
                      </Tag>
                    ))}
                  </div>
                  <div className="mb-1.5 font-display text-[16px] font-semibold leading-tight">
                    {r.emoji ? `${r.emoji} ` : ""}
                    {r.name}
                  </div>
                  <div className="mb-2 flex gap-3">
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <Flame size={12} strokeWidth={2.2} className="text-gold" /> {r.kcal} kcal
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <Clock size={12} strokeWidth={2.2} /> {r.time_minutes} min
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <MacroPill label="P" value={r.protein_g} />
                    <MacroPill label="C" value={r.carbs_g} />
                    <MacroPill label="G" value={r.fat_g} />
                  </div>
                </div>
                <span className="shrink-0 text-ink-faint">
                  {expanded === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {expanded === r.id && (
                <div className="border-t border-line bg-cream px-4 pb-4 pt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold">Ingredienti</div>
                  <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
                    {r.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                  <div className="mb-1.5 mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                    Preparazione
                  </div>
                  <ol className="list-decimal space-y-1 pl-4 text-[12.5px] leading-relaxed text-ink-soft">
                    {r.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>

                  <div className="mt-3.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(r);
                        setMode("edit");
                      }}
                      className="flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                    >
                      <Pencil size={12} strokeWidth={2.2} />
                      Modifica
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`Eliminare "${r.name}"?`)) startTransition(() => { deleteRecipe(r.id); });
                      }}
                      className="flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
                    >
                      <Trash2 size={12} strokeWidth={2.2} />
                      Elimina
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
