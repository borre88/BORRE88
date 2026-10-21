"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { INTAKE_SECTIONS, type IntakeFormData } from "@/lib/intake-form";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";
import { HealthConsentContent } from "@/components/legal/health-consent-content";
import { submitIntakeForm } from "./actions";

const SECTION_ACCENTS = ["text-teal", "text-gold-ink", "text-good"];

export function IntakeFormClient({ token, initialData }: { token: string; initialData: IntakeFormData }) {
  const [values, setValues] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    for (const section of INTAKE_SECTIONS) {
      init[section.key] = { ...(initialData[section.key] as Record<string, string> | undefined) };
    }
    return init;
  });
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [healthChecked, setHealthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function setField(sectionKey: string, fieldKey: string, value: string) {
    setValues((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [fieldKey]: value } }));
  }

  function submit() {
    if (!privacyChecked || !healthChecked) {
      setError("Devi accettare l'informativa privacy e il consenso al trattamento dei dati sulla salute per continuare.");
      return;
    }
    const payload: IntakeFormData = {
      ...values,
      consenso: { privacy: privacyChecked, dati_salute: healthChecked },
    };
    startTransition(async () => {
      const result = await submitIntakeForm(token, payload);
      if (result.error) setError(result.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 size={36} strokeWidth={1.8} className="mx-auto mb-3 text-good" />
        <h2 className="font-display text-lg font-bold">Grazie, è tutto salvato!</h2>
        <p className="mt-1.5 text-sm text-ink-faint">
          Il tuo trainer avrà già tutto pronto. Ci vediamo alla prossima visita.
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  return (
    <div className="space-y-4">
      {INTAKE_SECTIONS.map((section, i) => {
        const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length];
        return (
          <section key={section.key} className="rounded-xl border border-line bg-surface p-4">
            <h2 className={`mb-3 font-display text-base font-semibold ${accent}`}>{section.label}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.fields.map((field) => {
                const value = values[section.key]?.[field.key] ?? "";
                return (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-medium text-ink-soft">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={value}
                        onChange={(e) => setField(section.key, field.key, e.target.value)}
                        rows={2}
                        className={inputClass}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={value}
                        onChange={(e) => setField(section.key, field.key, e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Seleziona…</option>
                        {field.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        value={value}
                        onChange={(e) => setField(section.key, field.key, e.target.value)}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Informativa privacy</h2>
        <div className="max-h-56 overflow-y-auto rounded-lg border border-line-soft bg-cream p-3.5">
          <PrivacyPolicyContent />
        </div>
        <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={privacyChecked} onChange={(e) => setPrivacyChecked(e.target.checked)} className="mt-0.5" />
          Ho letto e compreso l&apos;informativa privacy.
        </label>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Consenso al trattamento dei dati sulla salute (art. 9 GDPR)</h2>
        <HealthConsentContent />
        <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={healthChecked} onChange={(e) => setHealthChecked(e.target.checked)} className="mt-0.5" />
          Do il mio consenso esplicito al trattamento dei miei dati relativi alla salute per le finalità descritte.
        </label>
      </section>

      {error && <p className="text-xs font-medium text-bad">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="w-full rounded-lg bg-teal px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Invio…" : "Invia questionario"}
      </button>
    </div>
  );
}
