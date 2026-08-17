"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5">
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-2xl border border-line bg-surface px-8 pb-6 pt-8 text-center shadow-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mx-auto mb-3.5 flex justify-center"
        >
          <BrandMark size="lg" />
        </motion.div>
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
            className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
          />
          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mb-4 w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
          />

          {state?.error && <p className="mb-3 text-xs font-medium text-bad">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white shadow-sm disabled:opacity-60"
          >
            <ShieldCheck size={14} strokeWidth={2.2} />
            {pending ? "Accesso…" : "Entra"}
          </button>
        </form>

        <p className="mt-6 text-[10.5px] leading-relaxed text-ink-faint">
          Non hai ancora un account?{" "}
          <Link href="/registrati" className="font-medium text-teal underline underline-offset-2">
            Registrati qui
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
