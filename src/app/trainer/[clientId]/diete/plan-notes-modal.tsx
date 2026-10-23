"use client";

import { useMemo, useState, useTransition } from "react";
import { ClipboardList, X, Sparkles, Droplet, Plus, Trash2, Layers, BookOpen, Save } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { createRecommendation } from "@/app/trainer/raccomandazioni/actions";
import {
  updatePlanNotesAndHydration,
  addRecommendedSupplement,
  removeRecommendedSupplement,
} from "./actions";

type Supplement = Tables<"supplements">;
type Recommendation = Tables<"recommendations">;
type Protocol = Tables<"protocols">;
type RecommendedSupplement = Tables<"diet_plan_recommended_supplements">;
type Plan = Tables<"diet_plans"> & { diet_plan_recommended_supplements: RecommendedSupplement[] };

const HYDRATION_PRESETS = [1500, 2000, 2500, 3000, 3500];

export function PlanNotesButton({
  clientId,
  plan,
  supplements,
  recommendations,
  protocols,
}: {
  clientId: string;
  plan: Plan;
  supplements: Supplement[];
  recommendations: Recommendation[];
  protocols: Protocol[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-soft hover:border-teal hover:text-teal"
      >
        <ClipboardList size={14} strokeWidth={2.2} />
        Note e Raccomandazioni
      </button>
      {open && (
        <PlanNotesModal
          clientId={clientId}
          plan={plan}
          supplements={supplements}
          recommendations={recommendations}
          protocols={protocols}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function PlanNotesModal({
  clientId,
  plan,
  supplements,
  recommendations,
  protocols,
  onClose,
}: {
  clientId: string;
  plan: Plan;
  supplements: Supplement[];
  recommendations: Recommendation[];
  protocols: Protocol[];
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(plan.notes ?? "");
  const [hydrationMl, setHydrationMl] = useState<number | null>(plan.hydration_ml ?? null);
  const [customMl, setCustomMl] = useState(
    plan.hydration_ml && !HYDRATION_PRESETS.includes(plan.hydration_ml) ? plan.hydration_ml.toString() : ""
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [addingSupplement, setAddingSupplement] = useState(false);
  const [supplementQuery, setSupplementQuery] = useState("");
  const [protocolsOpen, setProtocolsOpen] = useState(false);
  const [recsOpen, setRecsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const supplementsById = useMemo(() => new Map(supplements.map((s) => [s.id, s])), [supplements]);
  const recommended = plan.diet_plan_recommended_supplements;
  const addedIds = useMemo(() => new Set(recommended.map((r) => r.supplement_id)), [recommended]);

  const matches = useMemo(() => {
    const q = supplementQuery.trim().toLowerCase();
    if (!q) return [];
    return supplements.filter((s) => !addedIds.has(s.id) && s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [supplements, supplementQuery, addedIds]);

  async function generateAISuggestions() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/plan-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          phase: plan.phase,
          targetKcal: plan.target_kcal,
          targetProtein: plan.target_protein_g,
          targetCarbs: plan.target_carbs_g,
          targetFat: plan.target_fat_g,
          supplementNames: recommended.map((r) => supplementsById.get(r.supplement_id)?.name).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "Errore nella generazione dei suggerimenti.");
        return;
      }
      if (typeof data.notes === "string" && data.notes.trim()) setNotes(data.notes.trim());
      if (data.hydration_ml != null && hydrationMl == null) {
        const ml = Number(data.hydration_ml);
        setHydrationMl(ml);
        setCustomMl(HYDRATION_PRESETS.includes(ml) ? "" : ml.toString());
      }
    } catch {
      setAiError("L'assistente AI non è riuscito a rispondere. Riprova tra poco.");
    } finally {
      setAiLoading(false);
    }
  }

  function applyProtocol(protocol: Protocol) {
    const items = (protocol.items as { name: string; note?: string | null }[]) ?? [];
    const lines = items.map((it) => `• ${it.name}${it.note ? ` — ${it.note}` : ""}`).join("\n");
    const block = `${protocol.title}:\n${lines}`;
    setNotes((prev) => (prev.trim() ? `${prev}\n\n${block}` : block));
    setProtocolsOpen(false);
  }

  function insertRecommendation(body: string) {
    setNotes((prev) => (prev.trim() ? `${prev}\n\n${body}` : body));
    setRecsOpen(false);
  }

  function saveAsTemplate() {
    if (!notes.trim()) return;
    const title = window.prompt("Titolo del modello di raccomandazione:", plan.name);
    if (!title || !title.trim()) return;
    startTransition(async () => {
      await createRecommendation({ title: title.trim(), body: notes.trim() });
    });
  }

  function confirmNotes() {
    startTransition(async () => {
      await updatePlanNotesAndHydration(clientId, plan.id, { notes: notes.trim() || null, hydration_ml: hydrationMl });
      onClose();
    });
  }

  const pillBase = "rounded-full border px-3 py-1.5 text-[12px] font-medium";
  const pillActive = "border-teal bg-teal text-white";
  const pillInactive = "border-line bg-cream text-ink-soft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
              <ClipboardList size={17} strokeWidth={2.2} />
            </span>
            <div>
              <div className="font-display text-[15px] font-bold">Note e Integrazione</div>
              <div className="text-[11.5px] text-ink-faint">Personalizza le raccomandazioni del piano</div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="text-ink-faint hover:text-ink">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-5 rounded-xl border border-teal-soft-line bg-teal-soft px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-teal">
                <Sparkles size={13} strokeWidth={2.2} />
                Suggerimenti AI · Integrazione e note
              </span>
              <button
                type="button"
                disabled={aiLoading}
                onClick={generateAISuggestions}
                className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-60"
              >
                <Sparkles size={12} strokeWidth={2.2} />
                {aiLoading ? "Generazione…" : "Genera suggerimenti AI"}
              </button>
            </div>
            <p className="mt-1.5 text-[11.5px] italic leading-relaxed text-teal/80">
              Premi &quot;Genera suggerimenti AI&quot; per ottenere indicazioni su integrazione e una bozza di nota al
              paziente, basate sul riepilogo del piano.
            </p>
            {aiError && <p className="mt-1.5 text-[11px] font-medium text-bad">{aiError}</p>}
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold">
              <Droplet size={14} strokeWidth={2.2} className="text-teal" />
              Idratazione
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {HYDRATION_PRESETS.map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => {
                    setHydrationMl(ml);
                    setCustomMl("");
                  }}
                  className={`${pillBase} ${hydrationMl === ml ? pillActive : pillInactive}`}
                >
                  {(ml / 1000).toFixed(1).replace(".", ",")} L
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setHydrationMl(null);
                  setCustomMl("");
                }}
                className={`${pillBase} ${hydrationMl === null ? pillActive : pillInactive}`}
              >
                Standard
              </button>
              <span className="text-[11.5px] text-ink-faint">oppure</span>
              <input
                type="number"
                value={customMl}
                onChange={(e) => {
                  setCustomMl(e.target.value);
                  const v = Number(e.target.value);
                  setHydrationMl(e.target.value.trim() && v > 0 ? v : null);
                }}
                placeholder="—"
                className="w-20 rounded-md border border-line bg-cream px-2 py-1.5 text-[12px] outline-none focus:border-teal"
              />
              <span className="text-[11.5px] text-ink-faint">ml</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
              Senza un valore l&apos;app usa il suo standard: 2,0 L al giorno (otto bicchieri). Non resta senza
              obiettivo.
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
                <Plus size={14} strokeWidth={2.2} className="text-teal" />
                Integratori Consigliati
              </span>
              <div className="flex items-center gap-2.5">
                {protocols.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProtocolsOpen((v) => !v)}
                      className="flex items-center gap-1 text-[11.5px] font-medium text-teal"
                    >
                      <Layers size={12} strokeWidth={2.2} />
                      Piani Integrativi
                    </button>
                    {protocolsOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProtocolsOpen(false)} />
                        <div className="absolute right-0 top-full z-20 mt-1 max-h-52 w-56 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg">
                          {protocols.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => applyProtocol(p)}
                              className="block w-full rounded-md px-2.5 py-1.5 text-left text-[12px] text-ink-soft hover:bg-teal-soft hover:text-teal"
                            >
                              {p.title}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAddingSupplement((v) => !v)}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-teal"
                >
                  <Plus size={12} strokeWidth={2.2} />
                  Aggiungi
                </button>
              </div>
            </div>

            {addingSupplement && (
              <div className="mb-2 rounded-lg border border-line bg-cream p-1.5">
                <input
                  autoFocus
                  value={supplementQuery}
                  onChange={(e) => setSupplementQuery(e.target.value)}
                  placeholder="Cerca integratore…"
                  className="mb-1 w-full rounded border border-line bg-surface px-2 py-1 text-[12px] outline-none focus:border-teal"
                />
                {matches.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded border border-line bg-surface">
                    {matches.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          startTransition(() => addRecommendedSupplement(clientId, plan.id, s.id));
                          setSupplementQuery("");
                          setAddingSupplement(false);
                        }}
                        className="block w-full px-2 py-1 text-left text-[12px] hover:bg-teal-soft"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recommended.length === 0 ? (
              <p className="py-2 text-center text-[11.5px] italic text-ink-faint">Nessun integratore aggiunto.</p>
            ) : (
              <div className="space-y-1.5">
                {recommended.map((r) => {
                  const supplement = supplementsById.get(r.supplement_id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-2.5 py-1.5"
                    >
                      <span className="truncate text-[12px] font-medium">{supplement?.name ?? "Integratore"}</span>
                      <button
                        type="button"
                        onClick={() => startTransition(() => removeRecommendedSupplement(clientId, r.id))}
                        aria-label="Rimuovi integratore"
                        className="shrink-0 text-ink-faint hover:text-bad"
                      >
                        <Trash2 size={12} strokeWidth={2.2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12.5px] font-semibold">Raccomandazioni Generali</span>
              <div className="flex items-center gap-2.5">
                {recommendations.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRecsOpen((v) => !v)}
                      className="flex items-center gap-1 text-[11.5px] font-medium text-teal"
                    >
                      <BookOpen size={12} strokeWidth={2.2} />
                      Modelli
                    </button>
                    {recsOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setRecsOpen(false)} />
                        <div className="absolute right-0 top-full z-20 mt-1 max-h-52 w-60 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg">
                          {recommendations.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => insertRecommendation(r.body)}
                              className="block w-full rounded-md px-2.5 py-1.5 text-left text-[12px] text-ink-soft hover:bg-teal-soft hover:text-teal"
                            >
                              {r.title}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  disabled={!notes.trim() || pending}
                  onClick={saveAsTemplate}
                  className="flex items-center gap-1 text-[11.5px] font-medium text-teal disabled:opacity-40"
                >
                  <Save size={12} strokeWidth={2.2} />
                  Salva Modello
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={aiLoading}
              onClick={generateAISuggestions}
              className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-teal disabled:opacity-60"
            >
              <Sparkles size={12} strokeWidth={2.2} />
              {aiLoading ? "Generazione…" : "Genera con NutriAssistant"}
            </button>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Scrivi qui consigli su idratazione, attività fisica o altre note importanti…"
              className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-[12.5px] outline-none focus:border-teal"
            />
          </div>
        </div>

        <div className="border-t border-line px-5 py-3.5">
          <button
            type="button"
            disabled={pending}
            onClick={confirmNotes}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal py-3 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Salvataggio…" : "Conferma Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
