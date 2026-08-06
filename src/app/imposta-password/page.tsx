"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";

const GENERIC_INVALID_LINK =
  "Il link non è valido o è scaduto. Chiedi al tuo trainer di inviartene uno nuovo.";

export default function ImpostaPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("checking");
  const [linkError, setLinkError] = useState(GENERIC_INVALID_LINK);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const queryParams = new URLSearchParams(window.location.search);

      const description = hashParams.get("error_description") || queryParams.get("error_description");
      if (description) {
        if (!cancelled) {
          setLinkError(decodeURIComponent(description.replace(/\+/g, " ")));
          setStatus("invalid");
        }
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }

      const code = queryParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        return;
      }

      // No token in the URL (e.g. page reload after success): fall back to
      // whatever session may already be stored.
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setStatus(data.session ? "ready" : "invalid");
    }

    establishSession();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (password !== confirm) {
      setFormError("Le due password non coincidono.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setFormError("Non è stato possibile impostare la password. Riprova.");
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

        {status === "ready" ? (
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
            {formError && <p className="mb-3 text-xs font-medium text-bad">{formError}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Salvataggio…" : "Imposta password ed entra"}
            </button>
          </form>
        ) : status === "invalid" ? (
          <p className="text-xs font-medium text-bad">{linkError}</p>
        ) : (
          <p className="text-xs text-ink-faint">Verifica del link in corso…</p>
        )}
      </div>
    </div>
  );
}
