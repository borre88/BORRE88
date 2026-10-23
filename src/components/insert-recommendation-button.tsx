"use client";

import { useState } from "react";
import { Stethoscope, ChevronDown } from "lucide-react";
import type { Tables } from "@/lib/database.types";

type Recommendation = Tables<"recommendations">;

export function InsertRecommendationButton({
  recommendations,
  onInsert,
}: {
  recommendations: Recommendation[];
  onInsert: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (recommendations.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
      >
        <Stethoscope size={12} strokeWidth={2.2} />
        Inserisci raccomandazione
        <ChevronDown size={11} strokeWidth={2.2} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg">
            {recommendations.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onInsert(r.body);
                  setOpen(false);
                }}
                className="block w-full rounded-md px-2.5 py-1.5 text-left text-[12px] text-ink-soft hover:bg-teal-soft hover:text-teal"
              >
                {r.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
