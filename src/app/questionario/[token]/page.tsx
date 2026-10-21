import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandMark } from "@/components/brand-mark";
import { IntakeFormClient } from "./intake-form-client";
import type { IntakeFormData } from "@/lib/intake-form";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden p-5 py-10 sm:items-center">
      <Link
        href="/privacy"
        target="_blank"
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-teal hover:text-teal"
      >
        <ShieldCheck size={13} strokeWidth={2.2} />
        Privacy
      </Link>
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-line bg-surface px-6 py-8 sm:px-9">
        <div className="mb-5 flex justify-center">
          <BrandMark size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function IntakeFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: form } = await admin.from("intake_forms").select("*").eq("token", token).maybeSingle();

  if (!form) {
    return (
      <Shell>
        <div className="text-center">
          <h1 className="font-display text-xl font-bold">Link non valido</h1>
          <p className="mt-2 text-sm text-ink-faint">
            Questo link non esiste o non è più disponibile. Chiedi al tuo trainer di mandartene uno nuovo.
          </p>
        </div>
      </Shell>
    );
  }

  if (form.status === "completed") {
    return (
      <Shell>
        <div className="text-center">
          <CheckCircle2 size={32} strokeWidth={1.8} className="mx-auto mb-3 text-good" />
          <h1 className="font-display text-xl font-bold">Questionario già inviato</h1>
          <p className="mt-2 text-sm text-ink-faint">
            Grazie, abbiamo già ricevuto le tue risposte. Ci vediamo alla prossima visita!
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-5 text-center">
        <h1 className="font-display text-xl font-bold">Questionario pre-visita</h1>
        <p className="mt-1.5 text-sm text-ink-faint">
          Compila con calma, ti servirà qualche minuto: il tuo trainer avrà tutto pronto quando arrivi in studio.
        </p>
      </div>
      <IntakeFormClient token={token} initialData={(form.data ?? {}) as IntakeFormData} />
    </Shell>
  );
}
