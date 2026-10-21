"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Copy, Check, Trash2, X, ClipboardList } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { createIntakeForm, deleteIntakeForm } from "./actions";

type Form = Tables<"intake_forms"> & { clients: { full_name: string } | null };
type ClientOption = { id: string; full_name: string };

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-gold-soft", text: "text-gold-ink", label: "In attesa" },
  completed: { bg: "bg-good/10", text: "text-good", label: "Compilato" },
};

export function IntakeList({ forms, clients }: { forms: Form[]; clients: ClientOption[] }) {
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function copyLink(token: string, id: string) {
    const link = `${window.location.origin}/questionario/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="mb-4 flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
      >
        <Plus size={13} strokeWidth={2.2} />
        Nuovo questionario
      </button>

      {creating && (
        <NewIntakeForm
          clients={clients}
          onCreated={(link) => {
            setNewLink(link);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {newLink && (
        <div className="mb-4 rounded-xl border border-teal-soft-line bg-teal-soft px-4 py-3">
          <div className="mb-1.5 text-[12px] font-semibold text-teal">Link creato — mandalo al cliente:</div>
          <div className="flex items-center gap-2">
            <input readOnly value={newLink} className="flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px]" />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(newLink)}
              className="flex items-center gap-1 rounded-md bg-teal px-2.5 py-1.5 text-[11px] font-medium text-white"
            >
              <Copy size={12} strokeWidth={2.2} />
              Copia
            </button>
          </div>
          <button type="button" onClick={() => setNewLink(null)} className="mt-2 text-[11px] text-ink-faint underline">
            Chiudi
          </button>
        </div>
      )}

      {forms.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <ClipboardList size={20} strokeWidth={1.8} className="text-ink-faint" />
          <p className="text-[12.5px] text-ink-faint">Nessun questionario creato ancora.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {forms.map((f) => {
            const style = STATUS_STYLES[f.status] ?? STATUS_STYLES.pending;
            return (
              <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <Link href={`/trainer/questionari/${f.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {f.label || f.clients?.full_name || "Senza nome"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-faint">
                    Creato il {new Date(f.created_at).toLocaleDateString("it-IT")}
                    {f.clients?.full_name && !f.label ? "" : f.clients?.full_name ? ` · cliente: ${f.clients.full_name}` : ""}
                  </div>
                </Link>
                <div className="flex shrink-0 gap-1.5">
                  {f.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => copyLink(f.token, f.id)}
                      className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                    >
                      {copiedId === f.id ? <Check size={12} strokeWidth={2.2} /> : <Copy size={12} strokeWidth={2.2} />}
                      {copiedId === f.id ? "Copiato" : "Copia link"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (confirm("Eliminare questo questionario?")) startTransition(() => deleteIntakeForm(f.id));
                    }}
                    aria-label="Elimina"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:text-bad"
                  >
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewIntakeForm({
  clients,
  onCreated,
  onCancel,
}: {
  clients: ClientOption[];
  onCreated: (link: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createIntakeForm(label || null, clientId || null);
      if (result.error) setError(result.error);
      else if (result.link) onCreated(result.link);
    });
  }

  return (
    <div className="mb-4 rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Nuovo questionario</span>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="intake-label">
          Etichetta (facoltativa)
        </label>
        <input
          id="intake-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Es. Mario Rossi - prima visita"
          className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal"
        />
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="intake-client">
          Collega a un cliente esistente (facoltativo)
        </label>
        <select
          id="intake-client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal"
        >
          <option value="">Nessuno — nuovo contatto</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-lg bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending ? "Creazione…" : "Crea link"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
