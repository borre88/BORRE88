"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Copy, Check, FlaskConical } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { ProtocolItemInput } from "./actions";
import { deleteProtocol } from "./actions";
import { ProtocolForm } from "./protocol-form";

type Protocol = Tables<"protocols">;

function formatProtocolText(p: Protocol): string {
  const items = (p.items as unknown as ProtocolItemInput[] | null) ?? [];
  const lines = items.map((it) => (it.note ? `• ${it.name} — ${it.note}` : `• ${it.name}`));
  return [p.title, p.description ?? "", "", "Integratori:", ...lines].filter(Boolean).join("\n");
}

export function ProtocolList({ protocols }: { protocols: Protocol[] }) {
  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [editing, setEditing] = useState<Protocol | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (mode === "new") {
    return <ProtocolForm protocol={null} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  if (mode === "edit" && editing) {
    return <ProtocolForm protocol={editing} onDone={() => setMode("view")} onCancel={() => setMode("view")} />;
  }

  async function copy(p: Protocol) {
    try {
      await navigator.clipboard.writeText(formatProtocolText(p));
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((id) => (id === p.id ? null : id)), 1800);
    } catch {
      // clipboard non disponibile: nessuna azione
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setMode("new")}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
        >
          <Plus size={13} strokeWidth={2.2} />
          Nuovo protocollo
        </button>
      </div>

      {protocols.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface py-10 text-center">
          <p className="text-[12.5px] text-ink-faint">Nessun protocollo ancora.</p>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white"
          >
            <Plus size={13} strokeWidth={2.2} />
            Crea il primo protocollo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {protocols.map((p) => {
          const items = (p.items as unknown as ProtocolItemInput[] | null) ?? [];
          return (
            <div key={p.id} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-ink">
                  <FlaskConical size={14} strokeWidth={2.2} />
                </span>
                <div className="font-display text-[14.5px] font-semibold leading-tight">{p.title}</div>
              </div>
              {p.description && <p className="mb-2.5 text-[11.5px] leading-relaxed text-ink-faint">{p.description}</p>}

              <div className="mb-3 space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="rounded-md bg-cream px-2.5 py-1.5">
                    <div className="text-[12px] font-medium text-ink">{item.name}</div>
                    {item.note && <div className="text-[10.5px] leading-snug text-ink-faint">{item.note}</div>}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => copy(p)}
                  className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                >
                  {copiedId === p.id ? (
                    <>
                      <Check size={12} strokeWidth={2.4} className="text-good" />
                      Copiato
                    </>
                  ) : (
                    <>
                      <Copy size={12} strokeWidth={2.2} />
                      Copia testo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(p);
                    setMode("edit");
                  }}
                  className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal"
                >
                  <Pencil size={12} strokeWidth={2.2} />
                  Modifica
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Eliminare "${p.title}"?`)) startTransition(() => { deleteProtocol(p.id); });
                  }}
                  className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-soft hover:border-bad hover:text-bad"
                >
                  <Trash2 size={12} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
