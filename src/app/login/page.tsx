"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface px-8 pb-6 pt-8 text-center">
        <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal font-display text-lg font-bold text-white">
          N&P
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">Nutrition &amp; Performance</h1>
        <p className="mb-6 text-sm text-ink-faint">Accedi alla tua area riservata</p>

        <form action={action} className="text-left">
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
          />
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
          />

          {state?.error && <p className="mb-3 text-xs font-medium text-bad">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            <ShieldCheck size={14} strokeWidth={2.2} />
            {pending ? "Accesso…" : "Entra"}
          </button>
        </form>

        <p className="mt-6 text-[10.5px] leading-relaxed text-ink-faint">
          Se non hai ancora un account, contatta il tuo personal trainer: gli accessi vengono creati
          direttamente da lui.
        </p>
      </div>
    </div>
  );
}
