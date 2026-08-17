"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Pill, ExternalLink, PackageCheck, Clock, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { submitSupplementRequest } from "./actions";

type SupplementRequest = Tables<"supplement_requests">;

// Elenco segnaposto: sostituire con i prodotti reali del catalogo Mowe
// Nutrition (nome + una riga di beneficio) non appena disponibili.
const MOWE_PRODUCTS: { key: string; name: string; benefit: string }[] = [
  { key: "whey", name: "Proteine Whey", benefit: "Supportano il recupero muscolare dopo l'allenamento." },
  { key: "isolate", name: "Isolato proteico", benefit: "Assorbimento rapido, povero di grassi e lattosio." },
  { key: "creatina", name: "Creatina monoidrato", benefit: "Sostiene la performance negli sforzi brevi e intensi." },
  { key: "omega3", name: "Omega-3", benefit: "Supporta il benessere cardiovascolare generale." },
  { key: "multivitaminico", name: "Multivitaminico", benefit: "Copre eventuali carenze nei periodi di dieta più stretta." },
  { key: "bcaa", name: "BCAA / EAA", benefit: "Supportano la sintesi proteica negli allenamenti prolungati." },
  { key: "preworkout", name: "Pre-workout", benefit: "Energia e concentrazione per le sessioni più intense." },
  { key: "collagene", name: "Collagene", benefit: "Supporto al benessere di articolazioni e tessuto connettivo." },
];

const STATUS_LABELS: Record<string, string> = {
  nuova: "Richiesta inviata",
  in_lavorazione: "In lavorazione",
  conclusa: "Evasa",
};

function StatusBanner({ request }: { request: SupplementRequest }) {
  const isOpen = request.status !== "conclusa";
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
        <p className="text-[13px] font-medium text-ink">{STATUS_LABELS[request.status] ?? request.status}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">
          Richiesta inviata il {new Date(request.created_at).toLocaleDateString("it-IT")}. Il tuo coach ti
          risponderà con disponibilità e modalità di consegna.
        </p>
      </div>
    </div>
  );
}

export function IntegrazioniTab({
  hasClient,
  latestRequest,
}: {
  hasClient: boolean;
  latestRequest: SupplementRequest | null;
}) {
  const [state, action, pending] = useActionState(submitSupplementRequest, undefined);

  return (
    <div>
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-surface px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-teal/15 blur-3xl"
        />
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" aria-hidden className="spin-slow absolute inset-0 h-full w-full text-teal/25">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
            </svg>
            <span className="pulse-soft flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-md">
              <Pill size={24} strokeWidth={2} />
            </span>
          </div>
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold">
              In collaborazione con Mowe Nutrition
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">Integrazioni</h1>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-faint">
              Siamo partner di{" "}
              <a
                href="https://www.mowenutrition.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal underline underline-offset-2"
              >
                Mowe Nutrition
                <ExternalLink size={11} strokeWidth={2.4} className="ml-0.5 inline-block align-baseline" />
              </a>
              : scegli cosa ti serve, pensiamo noi al resto.
            </p>
          </div>
        </div>
      </div>

      <SectionLabel>Catalogo prodotti</SectionLabel>
      <div className="mb-6 mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOWE_PRODUCTS.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          >
            <Card className="h-full px-4 py-3.5 transition-shadow hover:shadow-md">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-teal">
                <Pill size={15} strokeWidth={2.2} />
              </div>
              <div className="mb-1 text-[13px] font-semibold leading-tight">{p.name}</div>
              <p className="text-[11.5px] leading-relaxed text-ink-faint">{p.benefit}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="px-5 py-4">
        <SectionLabel>Richiedi i tuoi integratori</SectionLabel>
        <p className="mt-1.5 mb-4 max-w-lg text-[12.5px] leading-relaxed text-ink-soft">
          Seleziona cosa ti interessa: ti ricontattiamo con quantità, prezzo e modalità di consegna.
        </p>

        {!hasClient ? (
          <p className="text-sm text-ink-faint">
            Il tuo trainer non ha ancora collegato una scheda cliente al tuo account.
          </p>
        ) : (
          <>
            {latestRequest && <StatusBanner request={latestRequest} />}

            <form action={action}>
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {MOWE_PRODUCTS.map((p) => (
                  <label
                    key={p.key}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-[12.5px] has-[:checked]:border-teal has-[:checked]:bg-teal-soft has-[:checked]:text-teal"
                  >
                    <input type="checkbox" name="items" value={p.key} className="accent-teal" />
                    {p.name}
                  </label>
                ))}
              </div>

              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="notes">
                Altre richieste o quantità
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Es. una confezione di creatina e due di whey al mese…"
                className="mb-4 w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />

              {state?.error && <p className="mb-3 text-xs font-medium text-bad">{state.error}</p>}
              {state?.success && (
                <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-teal">
                  <PackageCheck size={13} strokeWidth={2.4} />
                  Richiesta inviata al tuo coach.
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white shadow-sm disabled:opacity-60"
              >
                {pending ? "Invio…" : "Invia richiesta"}
              </button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
