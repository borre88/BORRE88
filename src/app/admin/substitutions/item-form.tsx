"use client";

import { useActionState, useRef, useEffect } from "react";
import type { ItemFormState } from "./actions";

const initialState: ItemFormState = {};

export function AddItemForm({
  action,
}: {
  action: (state: ItemFormState, formData: FormData) => Promise<ItemFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="item-name" className="text-xs font-medium text-stone-700">
          Alimento
        </label>
        <input
          id="item-name"
          name="name"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="item-quantity" className="text-xs font-medium text-stone-700">
          Quantità
        </label>
        <input
          id="item-quantity"
          name="quantity"
          required
          placeholder="150g"
          className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="item-notes" className="text-xs font-medium text-stone-700">
          Note (opzionale)
        </label>
        <input
          id="item-notes"
          name="notes"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Aggiunta..." : "Aggiungi"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}
