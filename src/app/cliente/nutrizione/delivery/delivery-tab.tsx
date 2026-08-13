"use client";

import { useActionState } from "react";
import { Soup, Target, Snowflake, Truck, Clock, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { SectionIntro } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { submitDeliveryRequest } from "./actions";

type DeliveryRequest = Tables<"delivery_requests">;

const GOAL_LABELS: Record<string, string> = {
  definizione: "Definizione",
  mantenimento: "Mantenimento",
  massa: "Massa",
};

const STATUS_LABELS: Record<string, string> = {
  nuova: "Richiesta inviata",
  in_lavorazione: "In lavorazione",
  attiva: "Servizio attivo",
  conclusa: "Conclusa",
};

const STEPS = [
  {
    icon: Soup,
    title: "Raccontaci i tuoi gusti",
    text: "Preferenze, alimenti da evitare, allergie: ci dici cosa ti piace e cosa no.",
  },
  {
    icon: Target,
    title: "In base al tuo obiettivo",
    text: "I pasti seguono i macro della dieta che il tuo nutrizionista ha già impostato per te.",
  },
  {
    icon: Snowflake,
    title: "Sottovuoto, pronti per il freezer",
    text: "Puoi conservarli comodamente e scongelarli quando vuoi, senza sprechi.",
  },
  {
    icon: Truck,
    title: "Consegna a casa",
    text: "Ricevi i pasti direttamente a casa tua, pronti da scaldare e mangiare.",
  },
];

function StatusBanner({ request }: { request: DeliveryRequest }) {
  const isOpen = request.status === "nuova" || request.status === "in_lavorazione";
  return (
    <div
      className={`mb-6 flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
        isOpen ? "border-gold bg-gold-soft" : "border-teal-soft-line bg-teal-soft"
      }`}
    >
      {isOpen ? (
        <Clock size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
      ) : (
        <CheckCircle2 size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-teal" />
      )}
      <div>
        <p className="text-[13px] font-medium text-ink">
          {STATUS_LABELS[request.status] ?? request.status}
          {request.goal && ` · obiettivo ${GOAL_LABELS[request.goal] ?? request.goal}`}
        </p>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">
          Richiesta inviata il {new Date(request.created_at).toLocaleDateString("it-IT")}. Il tuo coach ti
          contatterà per organizzare il servizio.
        </p>
      </div>
    </div>
  );
}

export function DeliveryTab({ hasClient, latestRequest }: { hasClient: boolean; latestRequest: DeliveryRequest | null }) {
  const [state, action, pending] = useActionState(submitDeliveryRequest, undefined);

  const hasOpenRequest =
    latestRequest && (latestRequest.status === "nuova" || latestRequest.status === "in_lavorazione" || latestRequest.status === "attiva");

  return (
    <div>
      <SectionIntro
        title="Delivery a domicilio"
        subtitle="Pasti bilanciati, pensati sui tuoi gusti e sul tuo obiettivo, consegnati direttamente a casa tua."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Card key={i} className="px-4 py-3.5">
            <s.icon size={18} strokeWidth={2} className="mb-2 text-teal" />
            <div className="mb-1 text-[13px] font-semibold leading-tight">{s.title}</div>
            <p className="text-[11.5px] leading-relaxed text-ink-faint">{s.text}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 px-4 py-3.5">
        <SectionLabel>Un servizio a 360 gradi</SectionLabel>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
          I pasti vengono creati su misura, incrociando il tuo gusto personale, il tuo obiettivo e i macro della
          dieta pensata dal tuo nutrizionista. Sono confezionati sottovuoto: si conservano in freezer e si
          consumano quando preferisci. Il servizio è disponibile anche per clienti privati, sportivi e squadre
          che cercano un supporto alimentare di livello elevato.
        </p>
      </Card>

      {latestRequest && <StatusBanner request={latestRequest} />}

      {!hasClient ? (
        <p className="text-sm text-ink-faint">Il tuo coach non ha ancora collegato una scheda cliente al tuo account.</p>
      ) : hasOpenRequest ? (
        <p className="text-[12.5px] text-ink-faint">
          Hai già una richiesta in corso. Per modificarla contatta direttamente il tuo coach.
        </p>
      ) : (
        <form action={action} className="rounded-xl border border-line bg-surface px-5 py-4">
          <div className="mb-3.5">
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="goal">
              Obiettivo
            </label>
            <select
              id="goal"
              name="goal"
              defaultValue=""
              className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
            >
              <option value="" disabled>
                Scegli un obiettivo
              </option>
              {Object.entries(GOAL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3.5">
            <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="preferences">
              Gusti, allergie e alimenti da evitare
            </label>
            <textarea
              id="preferences"
              name="preferences"
              rows={3}
              placeholder="Es. non mangio pesce, sono intollerante al lattosio, preferisco piatti speziati…"
              className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
            />
          </div>

          <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="notes">
            Altre richieste
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Numero di pasti a settimana, frequenza di consegna, altro…"
            className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
          />

          {state?.error && <p className="mt-3 text-xs font-medium text-bad">{state.error}</p>}
          {state?.success && <p className="mt-3 text-xs font-medium text-good">Richiesta inviata al tuo coach.</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-4 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Invio…" : "Richiedi il servizio"}
          </button>
        </form>
      )}
    </div>
  );
}
