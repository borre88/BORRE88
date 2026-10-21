"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Pill } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { firstSupplementCategory, formatSupplementPrice, supplementCategoryAccent } from "@/lib/supplements";
import { deleteSupplement } from "./actions";
import { SupplementForm } from "./supplement-form";

type Supplement = Tables<"supplements">;

export function SupplementList({ supplements }: { supplements: Supplement[] }) {
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [editing, setEditing] = useState<Supplement | null>(null);
  const [pending, startTransition] = useTransition();

  if (mode === "new") {
    return <SupplementForm supplement={null} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  if (mode === "edit" && editing) {
    return <SupplementForm supplement={editing} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
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
          Nuovo integratore
        </button>
      </div>

      {supplements.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <p className="text-[12.5px] text-ink-faint">Nessun integratore ancora.</p>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Aggiungi il primo prodotto
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {supplements.map((s) => {
          const accent = supplementCategoryAccent(s.category);
          const price = formatSupplementPrice(s.price_min, s.price_max);
          return (
            <div key={s.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex h-40 items-center justify-center bg-cream p-3">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt={s.name} className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <Pill size={28} strokeWidth={1.8} className="text-ink-faint" />
                )}
              </div>
              <div className="flex flex-1 flex-col px-4 py-3.5">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${accent.border} ${accent.bg} ${accent.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                    {firstSupplementCategory(s.category)}
                  </span>
                  {s.format && <span className="text-[10.5px] text-ink-faint">{s.format}</span>}
                </div>
                <div className="font-display text-[14.5px] font-semibold leading-tight">{s.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-faint">
                  {s.package_size ? `${s.package_size}` : ""}
                  {s.package_size && price ? " · " : ""}
                  {price && <span className="font-medium text-ink-soft">{price}</span>}
                </div>
                {s.suggested_use && <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">{s.suggested_use}</p>}
                {s.ingredients && (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-ink-faint">{s.ingredients}</p>
                )}

                <div className="mt-auto flex items-center gap-1.5 pt-3">
                  {s.product_url && (
                    <a
                      href={s.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                    >
                      <ExternalLink size={12} strokeWidth={2.2} />
                      Scheda
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(s);
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
                      if (confirm(`Eliminare "${s.name}"?`))
                        startTransition(() => {
                          deleteSupplement(s.id);
                        });
                    }}
                    className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
                  >
                    <Trash2 size={12} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
