"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteClientAccount } from "./actions";

export function DeleteClientButton({ clientId, name }: { clientId: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Rimuovi cliente"
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (
          confirm(
            `Eliminare la scheda di ${name}? L'account di accesso del cliente verrà rimosso insieme a tutte le rilevazioni. L'azione non è reversibile.`
          )
        ) {
          startTransition(() => {
            deleteClientAccount(clientId);
          });
        }
      }}
      className="flex shrink-0 p-0.5 text-ink-faint opacity-60 hover:opacity-100"
    >
      <Trash2 size={13} strokeWidth={2.2} />
    </button>
  );
}
