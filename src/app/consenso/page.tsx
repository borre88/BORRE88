import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
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
        <section className="rounded-xl border border-dashed border-gold bg-gold-soft p-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
            Segnaposto — da completare con un consulente privacy
          </div>
          <h2 className="font-display text-lg font-semibold">Informativa privacy (art. 13 GDPR)</h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            [Qui andrà il testo dell&apos;informativa privacy: titolare del trattamento, finalità e base
            giuridica, tipologie di dati trattati, tempi di conservazione, eventuali soggetti terzi
            (es. Supabase come responsabile del trattamento), diritti dell&apos;interessato (accesso,
            rettifica, cancellazione, portabilità) e modalità per esercitarli.]
          </p>
          <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
            <input type="checkbox" required className="mt-0.5" />
            Ho letto e compreso l&apos;informativa privacy.
          </label>
        </section>

        <section className="rounded-xl border border-dashed border-gold bg-gold-soft p-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
            Segnaposto — da completare con un consulente privacy
          </div>
          <h2 className="font-display text-lg font-semibold">
            Consenso al trattamento dei dati sulla salute (art. 9 GDPR)
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            [Qui andrà la richiesta di consenso esplicito al trattamento dei dati relativi alla
            salute che il tuo personal trainer registrerà nel tempo (sonno, frequenza cardiaca,
            VO2max, massimali, peso), necessario in quanto categoria particolare di dati ai sensi
            dell&apos;art. 9 GDPR.]
          </p>
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
    </div>
  );
}
