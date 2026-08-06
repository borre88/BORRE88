"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ImpostaPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let settled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!settled && data.session) {
        settled = true;
        setReady(true);
      }
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        setError("Il link non è valido o è scaduto. Chiedi al tuo trainer di inviartene uno nuovo.");
      }
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le due password non coincidono.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("Non è stato possibile impostare la password. Riprova.");
      return;
    }

    router.replace("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface px-8 pb-6 pt-8 text-center">
        <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal font-display text-lg font-bold text-white">
          N&P
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">Imposta la tua password</h1>
        <p className="mb-6 text-sm text-ink-faint">
          Scegli una password per accedere a Nutrition &amp; Performance.
        </p>

        {ready ? (
          <form onSubmit={handleSubmit} className="text-left">
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="password">
              Nuova password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="confirm">
              Conferma password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
            {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Salvataggio…" : "Imposta password ed entra"}
            </button>
          </form>
        ) : error ? (
          <p className="text-xs font-medium text-bad">{error}</p>
        ) : (
          <p className="text-xs text-ink-faint">Verifica del link in corso…</p>
        )}
      </div>
    </div>
  );
}
