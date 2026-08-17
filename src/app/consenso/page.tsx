import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";
import { HealthConsentContent } from "@/components/legal/health-consent-content";
import { acceptConsent } from "./actions";

export default async function ConsensoPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "cliente") redirect("/trainer");
  if (session.profile.privacy_accepted_at && session.profile.health_data_consent_at) {
    redirect("/cliente");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold">Prima di iniziare</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Per usare l&apos;app dobbiamo trattare alcuni tuoi dati, compresi dati che riguardano la tua
        salute (es. frequenza cardiaca, peso, massimali). Leggi e accetta quanto segue.
      </p>

      <form action={acceptConsent} className="mt-6 space-y-5">
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">Informativa privacy</h2>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-line-soft bg-cream p-3.5">
            <PrivacyPolicyContent />
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
            <input type="checkbox" required className="mt-0.5" />
            Ho letto e compreso l&apos;informativa privacy.
          </label>
        </section>

        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">
            Consenso al trattamento dei dati sulla salute (art. 9 GDPR)
          </h2>
          <div className="mt-3">
            <HealthConsentContent />
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
            <input type="checkbox" required className="mt-0.5" />
            Do il mio consenso esplicito al trattamento dei miei dati relativi alla salute per le
            finalità descritte.
          </label>
        </section>

        <button
          type="submit"
          className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white"
        >
          Accetto e continuo
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-ink-faint">
        Puoi leggere l&apos;informativa completa anche su{" "}
        <Link href="/privacy" target="_blank" className="text-teal underline underline-offset-2">
          questa pagina
        </Link>
        .
      </p>
    </div>
  );
}
