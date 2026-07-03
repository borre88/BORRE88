"use client";

import { useActionState } from "react";
import type { RecipeFormState } from "./actions";

const initialState: RecipeFormState = {};

type RecipeFormValues = {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  calories: string;
  tags: string;
};

export function RecipeForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  defaultValues?: Partial<RecipeFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Titolo" name="title" required defaultValue={defaultValues?.title} />
      <Field
        label="Descrizione breve"
        name="description"
        defaultValue={defaultValues?.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Calorie (opzionale)"
          name="calories"
          type="number"
          defaultValue={defaultValues?.calories}
        />
        <Field
          label="Tag (separati da virgola)"
          name="tags"
          placeholder="colazione, vegetariano"
          defaultValue={defaultValues?.tags}
        />
      </div>

      <TextAreaField
        label="Ingredienti (uno per riga)"
        name="ingredients"
        required
        rows={5}
        defaultValue={defaultValues?.ingredients}
      />

      <TextAreaField
        label="Preparazione (uno step per riga)"
        name="instructions"
        required
        rows={6}
        defaultValue={defaultValues?.instructions}
      />

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

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  required,
  rows,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows: number;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
      />
    </div>
  );
}
