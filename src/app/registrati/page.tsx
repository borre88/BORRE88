import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignupForm } from "./signup-form";

export default function RegistratiPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5 py-10">
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface px-8 pb-6 pt-8 text-center shadow-sm">
        <div className="mx-auto mb-3.5 flex justify-center">
          <BrandMark size="lg" />
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">Crea il tuo account</h1>
        <p className="mb-6 text-sm text-ink-faint">Accedi all&apos;area riservata di Nutrition &amp; Performance</p>

        <SignupForm />

        <p className="mt-6 text-[10.5px] leading-relaxed text-ink-faint">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-teal underline underline-offset-2">
            Accedi
          </Link>
        </p>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-faint">
          Creando un account accetti la nostra{" "}
          <Link href="/privacy" target="_blank" className="font-medium text-teal underline underline-offset-2">
            informativa privacy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
