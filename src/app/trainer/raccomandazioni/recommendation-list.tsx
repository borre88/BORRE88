"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Copy, Check, Stethoscope } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { deleteRecommendation } from "./actions";
import { RecommendationForm } from "./recommendation-form";

type Recommendation = Tables<"recommendations">;

export function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [editing, setEditing] = useState<Recommendation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (mode === "new") {
    return <RecommendationForm recommendation={null} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  if (mode === "edit" && editing) {
    return <RecommendationForm recommendation={editing} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  async function copy(r: Recommendation) {
    try {
      await navigator.clipboard.writeText(`${r.title}\n\n${r.body}`);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId((id) => (id === r.id ? null : id)), 1800);
    } catch {
      // clipboard non disponibile: nessuna azione
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setMode("new")}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={13} strokeWidth={2.2} />
          Nuova raccomandazione
        </button>
      </div>

      {recommendations.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <p className="text-[12.5px] text-ink-faint">Nessuna raccomandazione ancora.</p>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Crea la prima scheda
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {recommendations.map((r) => (
          <div key={r.id} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3.5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                  <Stethoscope size={14} strokeWidth={2.2} />
                </span>
                <div className="font-display text-[14.5px] font-semibold leading-tight">{r.title}</div>
              </div>
            </div>
            <p className="mb-3 line-clamp-5 whitespace-pre-line text-[11.5px] leading-relaxed text-ink-soft">{r.body}</p>
            <div className="mt-auto flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => copy(r)}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                {copiedId === r.id ? (
                  <>
                    <Check size={12} strokeWidth={2.4} className="text-good" />
                    Copiato
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={2.2} />
                    Copia testo
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(r);
                  setMode("edit");
                }}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                <Pencil size={12} strokeWidth={2.2} />
                Modifica
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Eliminare "${r.title}"?`)) startTransition(() => { deleteRecommendation(r.id); });
                }}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
              >
                <Trash2 size={12} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
