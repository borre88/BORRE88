"use client";

import { useActionState } from "react";
import { CATEGORIES } from "@/lib/longevity/questions";
import { createAssessmentAction, type AssessmentFormState } from "./actions";

const initialState: AssessmentFormState = {};

export function AssessmentForm() {
  const [state, formAction, pending] = useActionState(createAssessmentAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {CATEGORIES.map((category, index) => (
        <fieldset
          key={category.key}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <legend className="px-1 text-sm font-medium text-emerald-700">
            Area {index + 1} di {CATEGORIES.length}
          </legend>
          <h2 className="text-lg font-semibold text-stone-900">{category.title}</h2>
          <p className="mt-1 text-sm text-stone-600">{category.description}</p>

          <div className="mt-5 flex flex-col gap-5">
            {category.questions.map((question) => (
              <div key={question.id}>
                <p className="text-sm font-medium text-stone-800">{question.label}</p>
                <div className="mt-2 flex flex-col gap-2">
                  {question.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        required
                        className="accent-emerald-700"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {category.extraFields && category.extraFields.length > 0 && (
              <div className="mt-2 rounded-xl bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Facoltativo, ad uso del tuo nutrizionista
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {category.extraFields.map((field) =>
                    field.type === "number" ? (
                      <div key={field.id} className="flex flex-col gap-1.5">
                        <label htmlFor={field.id} className="text-sm font-medium text-stone-700">
                          {field.label} {field.unit && `(${field.unit})`}
                        </label>
                        <input
                          id={field.id}
                          name={field.id}
                          type="number"
                          step="0.1"
                          min="0"
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    ) : (
                      <div key={field.id} className="flex flex-col gap-1.5 sm:col-span-2">
                        <label htmlFor={field.id} className="text-sm font-medium text-stone-700">
                          {field.label}
                        </label>
                        <textarea
                          id={field.id}
                          name={field.id}
                          rows={2}
                          placeholder={field.placeholder}
                          className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </fieldset>
      ))}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Calcolo in corso..." : "Calcola il mio Longevity Score"}
      </button>
    </form>
  );
}
