"use client";

import { useState, useTransition } from "react";
import { createClientAccount } from "./actions";

export function NewClientForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await createClientAccount(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        onDone();
      }
    });
  }

  const inputClass =
    "mb-1.5 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  return (
    <form action={action} className="mb-2.5 rounded-lg bg-cream p-2.5">
      <input name="full_name" placeholder="Nome e cognome" required autoFocus className={inputClass} />
      <input name="email" type="email" placeholder="Email cliente" required className={inputClass} />
      <input name="phone" type="tel" placeholder="Telefono" required className={inputClass} />
      <div className="mb-1.5 flex gap-1.5">
        <input
          name="date_of_birth"
          type="date"
          aria-label="Data di nascita"
          required
          className={`${inputClass} mb-0`}
        />
        <select name="gender" aria-label="Sesso" required defaultValue="" className={`${inputClass} mb-0`}>
          <option value="" disabled>
            Sesso
          </option>
          <option value="maschio">Maschio</option>
          <option value="femmina">Femmina</option>
        </select>
      </div>
      {error && <p className="mb-1.5 text-[11px] font-medium text-bad">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-teal px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending ? "Creazione…" : "Aggiungi"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-soft"
        >
          Annulla
        </button>
      </div>
      <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-faint">
        Al cliente verrà inviata un&apos;email per impostare la propria password.
      </p>
    </form>
  );
}
