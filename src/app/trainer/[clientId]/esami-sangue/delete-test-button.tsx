"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBloodTest } from "./actions";

export function DeleteTestButton({ clientId, testId }: { clientId: string; testId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Elimina esame"
      disabled={pending}
      onClick={() => {
        if (confirm("Eliminare questo esame del sangue? L'azione non è reversibile.")) {
          startTransition(() => deleteBloodTest(clientId, testId));
        }
      }}
      className="flex items-center gap-1 text-xs font-medium text-ink-faint disabled:opacity-40"
    >
      <Trash2 size={13} strokeWidth={2} />
      Elimina
    </button>
  );
}
