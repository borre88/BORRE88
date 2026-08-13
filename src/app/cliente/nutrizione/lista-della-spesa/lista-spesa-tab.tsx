"use client";

import { useEffect, useRef, useTransition } from "react";
import { useActionState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { SectionIntro, EmptyState } from "@/components/ui";
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCheckedItems } from "./actions";

type Item = Tables<"shopping_list_items">;

export function ListaSpesaTab({ items }: { items: Item[] }) {
  const [state, action, pending] = useActionState(addShoppingItem, {});
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) formRef.current?.reset();
  }, [state]);

  const hasChecked = items.some((i) => i.checked);

  return (
    <div>
      <SectionIntro
        title="Lista della spesa"
        subtitle="Segna qui cosa comprare al supermercato. Dalle ricette puoi aggiungere gli ingredienti con un tocco."
      />

      <form ref={formRef} action={action} className="mb-4 flex gap-2">
        <input
          name="name"
          placeholder="Aggiungi un elemento…"
          required
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-teal"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Plus size={15} strokeWidth={2.2} />
          Aggiungi
        </button>
      </form>
      {state?.error && <p className="mb-3 text-xs font-medium text-bad">{state.error}</p>}

      {items.length === 0 ? (
        <EmptyState text="La lista è vuota. Aggiungi qualcosa da comprare o parti da una ricetta." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
              <button
                type="button"
                onClick={() => startTransition(() => toggleShoppingItem(item.id, !item.checked))}
                aria-label={item.checked ? "Segna da comprare" : "Segna come comprato"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  item.checked ? "border-teal bg-teal text-white" : "border-line text-transparent"
                }`}
              >
                <Check size={13} strokeWidth={3} />
              </button>
              <span className={`flex-1 text-sm ${item.checked ? "text-ink-faint line-through" : "text-ink"}`}>
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => startTransition(() => deleteShoppingItem(item.id))}
                aria-label="Rimuovi"
                className="shrink-0 text-ink-faint hover:text-bad"
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {hasChecked && (
        <button
          type="button"
          onClick={() => startTransition(() => clearCheckedItems())}
          className="mt-3 text-xs font-medium text-ink-faint hover:text-bad"
        >
          Svuota gli elementi già comprati
        </button>
      )}
    </div>
  );
}
