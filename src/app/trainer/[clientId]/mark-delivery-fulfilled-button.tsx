"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { markDeliveryRequestFulfilled } from "../actions";

export function MarkDeliveryFulfilledButton({ clientId, requestId }: { clientId: string; requestId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markDeliveryRequestFulfilled(clientId, requestId))}
      className="flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] font-medium text-ink-soft hover:border-teal hover:text-teal disabled:opacity-60"
    >
      <CheckCircle2 size={12} strokeWidth={2.2} />
      {pending ? "Un attimo…" : "Richiesta evasa"}
    </button>
  );
}
