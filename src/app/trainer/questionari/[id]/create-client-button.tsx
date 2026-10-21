"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createClientFromIntake } from "../actions";

export function CreateClientButton({ formId }: { formId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function create() {
    startTransition(async () => {
      const result = await createClientFromIntake(formId);
      if (result.error) setError(result.error);
      else if (result.clientId) router.push(`/trainer/${result.clientId}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={create}
        className="flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-xs font-medium text-white disabled:opacity-60"
      >
        <UserPlus size={14} strokeWidth={2.2} />
        {pending ? "Creazione…" : "Crea cliente da questo questionario"}
      </button>
      {error && <p className="mt-1.5 text-[11px] font-medium text-bad">{error}</p>}
    </div>
  );
}
