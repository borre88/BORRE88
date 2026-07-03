"use client";

import { useActionState } from "react";
import type { GroupFormState } from "./actions";

const initialState: GroupFormState = {};

export function GroupForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: GroupFormState, formData: FormData) => Promise<GroupFormState>;
  defaultValues?: { name?: string; description?: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Nome gruppo
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="Es. Fonti proteiche"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          Descrizione (opzionale)
        </label>
        <input
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Salvataggio..." : submitLabel}
      </button>
    </form>
  );
}
