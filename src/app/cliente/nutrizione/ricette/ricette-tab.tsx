"use client";

import { useMemo, useState } from "react";
import { Search, Flame, Clock, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { ChipGroup, EmptyState, MacroPill, SectionIntro, Tag } from "@/components/ui";

type Recipe = Tables<"recipes">;

const GOAL_LABELS: Record<string, string> = {
  definizione: "Definizione",
  mantenimento: "Mantenimento",
  massa: "Massa",
};

const MEAL_LABELS: Record<string, string> = {
  colazione: "Colazione",
  pranzo: "Pranzo",
  cena: "Cena",
  spuntino: "Spuntino",
};

export function RicetteTab({ recipes }: { recipes: Recipe[] }) {
  const [goal, setGoal] = useState("tutti");
  const [meal, setMeal] = useState("tutti");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (goal !== "tutti" && r.goal !== goal) return false;
      if (meal !== "tutti" && r.meal !== meal) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [recipes, goal, meal, query]);

  return (
    <div>
      <SectionIntro
        title="Ricette"
        subtitle="Filtra per obiettivo e momento della giornata. Ogni ricetta ha calorie e macro già calcolati."
      />

      <div className="mb-3.5 flex max-w-xs items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search size={14} strokeWidth={2} className="text-ink-faint" />
        <input
          placeholder="Cerca una ricetta…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-none bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mb-2">
        <ChipGroup
          value={goal}
          onChange={setGoal}
          options={[{ key: "tutti", label: "Tutti" }, ...Object.entries(GOAL_LABELS).map(([key, label]) => ({ key, label }))]}
        />
      </div>
      <div className="mb-4">
        <ChipGroup
          value={meal}
          onChange={setMeal}
          options={[{ key: "tutti", label: "Tutti i pasti" }, ...Object.entries(MEAL_LABELS).map(([key, label]) => ({ key, label }))]}
        />
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
                  <div className="mb-1.5 flex gap-1.5">
                    <Tag>{MEAL_LABELS[r.meal]}</Tag>
                    <Tag muted>{GOAL_LABELS[r.goal]}</Tag>
                  </div>
                  <div className="mb-1.5 font-display text-[17px] font-semibold leading-tight">{r.name}</div>
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
                  <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-teal-soft to-gold-soft text-4xl">
                    {r.emoji}
                  </div>
                  <div className="mb-1.5 mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                    Ingredienti
                  </div>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
