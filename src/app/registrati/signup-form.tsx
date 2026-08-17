"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { signUpClient, type SignupState } from "./actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState | undefined, FormData>(signUpClient, undefined);

  const inputClass =
    "w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal";
  const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

  return (
    <form action={action} className="text-left">
      <label className={labelClass} htmlFor="full_name">
        Nome e cognome
      </label>
      <input id="full_name" name="full_name" type="text" required autoFocus className={`mb-3.5 ${inputClass}`} />

      <label className={labelClass} htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" required className={`mb-3.5 ${inputClass}`} />

      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" required minLength={6} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="password_confirm">
            Conferma password
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            required
            minLength={6}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="date_of_birth">
            Data di nascita
          </label>
          <input id="date_of_birth" name="date_of_birth" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="gender">
            Sesso
          </label>
          <select id="gender" name="gender" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Scegli
            </option>
            <option value="maschio">Maschio</option>
            <option value="femmina">Femmina</option>
          </select>
        </div>
      </div>

      <label className={labelClass} htmlFor="phone">
        Telefono
      </label>
      <input id="phone" name="phone" type="tel" required className={`mb-4 ${inputClass}`} />

      {state?.error && <p className="mb-3 text-xs font-medium text-bad">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white shadow-sm disabled:opacity-60"
      >
        <UserPlus size={14} strokeWidth={2.2} />
        {pending ? "Creazione account…" : "Crea il mio account"}
      </button>
    </form>
  );
}
