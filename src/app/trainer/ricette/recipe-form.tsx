"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { GOAL_LABELS, MEAL_LABELS, TAG_LABELS } from "@/lib/recipes";
import { createRecipe, updateRecipe, type RecipeInput } from "./actions";

type Recipe = Tables<"recipes">;

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function RecipeForm({
  recipe,
  onDone,
  onCancel,
}: {
  recipe: Recipe | null;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [emoji, setEmoji] = useState(recipe?.emoji ?? "");
  const [kcal, setKcal] = useState(recipe?.kcal?.toString() ?? "");
  const [proteinG, setProteinG] = useState(recipe?.protein_g?.toString() ?? "");
  const [carbsG, setCarbsG] = useState(recipe?.carbs_g?.toString() ?? "");
  const [fatG, setFatG] = useState(recipe?.fat_g?.toString() ?? "");
  const [timeMinutes, setTimeMinutes] = useState(recipe?.time_minutes?.toString() ?? "20");
  const [goal, setGoal] = useState(recipe?.goal ?? "mantenimento");
  const [meal, setMeal] = useState(recipe?.meal ?? "pranzo");
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? []);
  const [ingredientsText, setIngredientsText] = useState((recipe?.ingredients ?? []).join("\n"));
  const [stepsText, setStepsText] = useState((recipe?.steps ?? []).join("\n"));

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function toggleTag(key: string) {
    setTags((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]));
  }

  function save() {
    if (!name.trim()) {
      setError("Il nome del piatto è obbligatorio.");
      return;
    }
    const ingredients = linesToList(ingredientsText);
    const steps = linesToList(stepsText);
    if (ingredients.length === 0) {
      setError("Aggiungi almeno un ingrediente.");
      return;
    }
    if (steps.length === 0) {
      setError("Aggiungi almeno uno step di preparazione.");
      return;
    }
    const input: RecipeInput = {
      name: name.trim(),
      emoji: emoji.trim() || null,
      kcal: Number(kcal) || 0,
      protein_g: Number(proteinG) || 0,
      carbs_g: Number(carbsG) || 0,
      fat_g: Number(fatG) || 0,
      time_minutes: Number(timeMinutes) || 0,
      goal,
      meal,
      tags,
      ingredients,
      steps,
    };

    startTransition(async () => {
      const result = recipe ? await updateRecipe(recipe.id, input) : await createRecipe(input);
      if (result.error) setError(result.error);
      else onDone(recipe?.id ?? ("recipeId" in result ? (result.recipeId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">{recipe ? "Modifica ricetta" : "Nuova ricetta"}</div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px]">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rcp-name">
            Nome del piatto
          </label>
          <input
            id="rcp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Pasta integrale con pomodorini, rucola e feta"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rcp-emoji">
            Emoji
          </label>
          <input id="rcp-emoji" value={emoji ?? ""} onChange={(e) => setEmoji(e.target.value)} placeholder="🍝" className={inputClass} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="rcp-kcal">
            Kcal
          </label>
          <input id="rcp-kcal" type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-teal" htmlFor="rcp-protein">
            Proteine (g)
          </label>
          <input id="rcp-protein" type="number" value={proteinG} onChange={(e) => setProteinG(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-gold-ink" htmlFor="rcp-carbs">
            Carboidrati (g)
          </label>
          <input id="rcp-carbs" type="number" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-bad" htmlFor="rcp-fat">
            Grassi (g)
          </label>
          <input id="rcp-fat" type="number" value={fatG} onChange={(e) => setFatG(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="rcp-time">
            Minuti
          </label>
          <input id="rcp-time" type="number" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">Obiettivo</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(GOAL_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGoal(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  goal === key ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-soft">Pasto</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(MEAL_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMeal(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  meal === key ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Caratteristiche</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TAG_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleTag(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                tags.includes(key) ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rcp-ingredients">
          Ingredienti (uno per riga)
        </label>
        <textarea
          id="rcp-ingredients"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={5}
          placeholder={"80g pasta integrale\n200g pomodorini\n..."}
          className={`${inputClass} leading-relaxed`}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rcp-steps">
          Preparazione (uno step per riga)
        </label>
        <textarea
          id="rcp-steps"
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          rows={6}
          placeholder={"Cuoci la pasta in acqua salata al dente.\n..."}
          className={`${inputClass} leading-relaxed`}
        />
      </div>

      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Sparkles size={15} strokeWidth={2.2} />
          {pending ? "Salvataggio…" : recipe ? "Salva modifiche" : "Crea ricetta"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
