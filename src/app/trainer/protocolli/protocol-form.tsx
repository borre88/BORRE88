"use client";

import { useState, useTransition } from "react";
import { Sparkles, X, Plus, Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { createProtocol, updateProtocol, type ProtocolInput, type ProtocolItemInput } from "./actions";

type Protocol = Tables<"protocols">;

export function ProtocolForm({
  protocol,
  onDone,
  onCancel,
}: {
  protocol: Protocol | null;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(protocol?.title ?? "");
  const [description, setDescription] = useState(protocol?.description ?? "");
  const existingItems = (protocol?.items as unknown as ProtocolItemInput[] | null) ?? [];
  const [items, setItems] = useState<ProtocolItemInput[]>(
    existingItems.length > 0 ? existingItems : [{ name: "", note: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass = "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  function updateItem(index: number, field: "name" | "note", value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", note: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }
    const cleanItems = items
      .map((it) => ({ name: it.name.trim(), note: it.note?.trim() || null }))
      .filter((it) => it.name);
    if (cleanItems.length === 0) {
      setError("Aggiungi almeno un integratore al protocollo.");
      return;
    }
    const input: ProtocolInput = { title: title.trim(), description: description?.trim() || null, items: cleanItems };

    startTransition(async () => {
      const result = protocol ? await updateProtocol(protocol.id, input) : await createProtocol(input);
      if (result.error) setError(result.error);
      else onDone(protocol?.id ?? ("protocolId" in result ? (result.protocolId as string) : ""));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-lg font-bold">{protocol ? "Modifica protocollo" : "Nuovo protocollo"}</div>
        <button type="button" onClick={onCancel} aria-label="Annulla" className="text-ink-soft">
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="proto-title">
          Titolo protocollo
        </label>
        <input
          id="proto-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Cellulite e ritenzione idrica"
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="proto-desc">
          Per chi è indicato (facoltativo)
        </label>
        <textarea
          id="proto-desc"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs font-medium text-ink-soft">Integratori del protocollo</span>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 rounded-lg border border-line bg-cream p-2">
              <div className="flex-1 space-y-1">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Nome integratore (es. Omega-3)"
                  className="w-full rounded border border-line bg-surface px-2 py-1 text-[12.5px] outline-none focus:border-teal"
                />
                <input
                  value={item.note ?? ""}
                  onChange={(e) => updateItem(i, "note", e.target.value)}
                  placeholder="Perché (facoltativo)"
                  className="w-full rounded border border-line bg-surface px-2 py-1 text-[11.5px] text-ink-faint outline-none focus:border-teal"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Rimuovi"
                className="mt-1 shrink-0 text-ink-faint hover:text-bad"
              >
                <Trash2 size={13} strokeWidth={2.2} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-teal"
        >
          <Plus size={13} strokeWidth={2.2} />
          Aggiungi integratore
        </button>
      </div>

      {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Sparkles size={15} strokeWidth={2.2} />
          {pending ? "Salvataggio…" : protocol ? "Salva modifiche" : "Crea protocollo"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft">
          Annulla
        </button>
      </div>
    </div>
  );
}
