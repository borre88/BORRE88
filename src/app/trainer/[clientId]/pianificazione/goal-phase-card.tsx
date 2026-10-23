"use client";

import { useMemo, useState, useTransition } from "react";
import { Crosshair, ChevronDown, Plus, Pencil, Check, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import {
  PHASE_LABELS,
  PHASE_ACCENT,
  SPEED_LABELS,
  estimateWeightGoal,
  type DietPhase,
  type DietSpeed,
} from "@/lib/diet-calc";
import { startGoalPhase, updateGoalPhase, setGoalPhaseStatus, type GoalPhaseInput } from "@/app/trainer/actions";

type GoalPhase = Tables<"client_goal_phases">;

const STATUS_LABELS: Record<string, string> = {
  attiva: "Attiva",
  completata: "Completata",
  abbandonata: "Abbandonata",
};

export function GoalPhaseCard({
  clientId,
  phases,
  currentWeightKg,
}: {
  clientId: string;
  phases: GoalPhase[];
  currentWeightKg: number | null;
}) {
  const [formOpen, setFormOpen] = useState<"new" | "edit" | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const activePhase = useMemo(() => phases.find((p) => p.status === "attiva") ?? null, [phases]);
  const history = useMemo(
    () => phases.filter((p) => p.status !== "attiva").sort((a, b) => (a.started_at < b.started_at ? 1 : -1)),
    [phases]
  );

  const estimate = useMemo(() => {
    if (!activePhase) return null;
    return estimateWeightGoal(
      activePhase.start_weight_kg,
      activePhase.target_weight_kg,
      activePhase.speed as DietSpeed,
      new Date(activePhase.started_at + "T00:00:00")
    );
  }, [activePhase]);

  if (formOpen) {
    return (
      <GoalPhaseForm
        clientId={clientId}
        existing={formOpen === "edit" ? activePhase : null}
        defaultWeightKg={currentWeightKg}
        onDone={() => setFormOpen(null)}
        onCancel={() => setFormOpen(null)}
      />
    );
  }

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Crosshair size={17} strokeWidth={2.2} />
          </span>
          <div>
            <div className="font-display text-[15px] font-bold">Obiettivo del Paziente</div>
            <div className="text-[11.5px] text-ink-faint">
              {activePhase
                ? `Fase ${phases.indexOf(activePhase) + 1} attiva: ${PHASE_LABELS[activePhase.phase as DietPhase] ?? activePhase.phase}`
                : "Nessun obiettivo impostato"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {history.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
              >
                Storico ({history.length})
                <ChevronDown size={11} strokeWidth={2.2} />
              </button>
              {historyOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setHistoryOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-64 overflow-y-auto rounded-lg border border-line bg-surface p-1.5 shadow-lg">
                    {history.map((p) => (
                      <div key={p.id} className="rounded-md px-2 py-1.5 text-[11.5px]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{PHASE_LABELS[p.phase as DietPhase] ?? p.phase}</span>
                          <span className="text-[10px] text-ink-faint">{STATUS_LABELS[p.status] ?? p.status}</span>
                        </div>
                        <div className="text-[10.5px] text-ink-faint">
                          {p.start_weight_kg} kg → {p.target_weight_kg} kg
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setFormOpen("new")}
            className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
          >
            <Plus size={12} strokeWidth={2.2} />
            Nuova fase
          </button>
          {activePhase && (
            <button
              type="button"
              onClick={() => setFormOpen("edit")}
              className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
            >
              <Pencil size={12} strokeWidth={2.2} />
              Modifica fase attiva
            </button>
          )}
        </div>
      </div>

      {activePhase ? (
        <div className="px-4 py-3.5">
          <div className="rounded-lg border-l-4 border-teal bg-cream px-3.5 py-3">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {(() => {
                const accent = PHASE_ACCENT[activePhase.phase as DietPhase];
                return (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${accent.border} ${accent.bg} ${accent.text}`}
                  >
                    {(PHASE_LABELS[activePhase.phase as DietPhase] ?? activePhase.phase).toUpperCase()}
                  </span>
                );
              })()}
              <span className="text-[11px] text-ink-faint">Fase {phases.indexOf(activePhase) + 1}</span>
            </div>
            <div className="text-[14px] font-semibold">
              {activePhase.start_weight_kg} kg → <span className="text-teal">{activePhase.target_weight_kg} kg</span>{" "}
              <span className="text-ink-faint">
                ({Math.abs(activePhase.start_weight_kg - activePhase.target_weight_kg).toFixed(1)} kg)
              </span>
            </div>
            {estimate && (
              <div className="mt-0.5 text-[11.5px] text-ink-soft">
                Pace: <strong>{SPEED_LABELS[activePhase.speed as DietSpeed] ?? activePhase.speed}</strong> · Stima:{" "}
                {estimate.weeks} settimane (~{(estimate.weeks / 4.345).toFixed(1)} mesi) · target{" "}
                {estimate.targetDate.toLocaleDateString("it-IT")}
              </div>
            )}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => setGoalPhaseStatus(clientId, activePhase.id, "completata"))}
                className="flex items-center gap-1 rounded-md border border-good/40 bg-good/10 px-2.5 py-1 text-[11px] font-medium text-good"
              >
                <Check size={11} strokeWidth={2.4} />
                Completata
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => setGoalPhaseStatus(clientId, activePhase.id, "abbandonata"))}
                className="flex items-center gap-1 rounded-md border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11px] font-medium text-bad"
              >
                <X size={11} strokeWidth={2.4} />
                Abbandona
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 px-4 py-6 text-center">
          <p className="text-[12px] text-ink-faint">
            Imposta un peso obiettivo per stimare i tempi e allineare il bilancio energetico.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Imposta obiettivo
          </button>
        </div>
      )}
    </div>
  );
}

function GoalPhaseForm({
  clientId,
  existing,
  defaultWeightKg,
  onDone,
  onCancel,
}: {
  clientId: string;
  existing: GoalPhase | null;
  defaultWeightKg: number | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<DietPhase>((existing?.phase as DietPhase) ?? "perdita_peso");
  const [speed, setSpeed] = useState<DietSpeed>((existing?.speed as DietSpeed) ?? "standard");
  const [startWeight, setStartWeight] = useState(existing?.start_weight_kg ?? defaultWeightKg ?? 70);
  const [targetWeight, setTargetWeight] = useState(existing?.target_weight_kg ?? defaultWeightKg ?? 70);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function save() {
    const input: GoalPhaseInput = { phase, speed, startWeightKg: startWeight, targetWeightKg: targetWeight };
    startTransition(async () => {
      if (existing) await updateGoalPhase(clientId, existing.id, input);
      else await startGoalPhase(clientId, input);
      onDone();
    });
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 font-display text-[15px] font-bold">
        {existing ? "Modifica fase attiva" : "Nuova fase obiettivo"}
      </div>

      <div className="mb-3">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Fase</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(PHASE_LABELS) as [DietPhase, string][]).map(([key, label]) => {
            const accent = PHASE_ACCENT[key];
            const selected = phase === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPhase(key)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  selected ? `${accent.border} ${accent.bg} ${accent.text}` : "border-line bg-surface text-ink-soft"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Pace</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(SPEED_LABELS) as [DietSpeed, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSpeed(key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                speed === key ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint">Peso di partenza (kg)</label>
          <input
            type="number"
            step="0.1"
            value={startWeight}
            onChange={(e) => setStartWeight(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10.5px] font-medium text-ink-faint">Peso obiettivo (kg)</label>
          <input
            type="number"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-teal px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {pending ? "Salvataggio…" : "Salva obiettivo"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-[13px] font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
