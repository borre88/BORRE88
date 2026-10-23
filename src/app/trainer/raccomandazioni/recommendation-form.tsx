"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { createRecommendation, updateRecommendation, type RecommendationInput } from "./actions";

type Recommendation = Tables<"recommendations">;

export function RecommendationForm({
  recommendation,
  onDone,
  onCancel,
}: {
  recommendation: Recommendation | null;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(recommendation?.title ?? "");
  const [body, setBody] = useState(recommendation?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function save() {
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    if (!body.trim()) {
      setError("Il testo è obbligatorio.");
      return;
    }
    const input: RecommendationInput = { title: title.trim(), body: body.trim() };

    startTransition(async () => {
      const result = recommendation
        ? await updateRecommendation(recommendation.id, input)
        : await createRecommendation(input);
      if (result.error) setError(result.error);
      else onDone(recommendation?.id ?? ("recommendationId" in result ? (result.recommendationId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">
          {recommendation ? "Modifica raccomandazione" : "Nuova raccomandazione"}
        </div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rec-title">
          Titolo (patologia / condizione)
        </label>
        <input
          id="rec-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Colesterolo alto"
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="rec-body">
          Testo (spiegazione + consigli nutrizione e integratori)
        </label>
        <textarea
          id="rec-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
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
          {pending ? "Salvataggio…" : recommendation ? "Salva modifiche" : "Crea raccomandazione"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
