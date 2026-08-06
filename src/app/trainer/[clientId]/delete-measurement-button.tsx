"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMeasurement } from "../actions";

export function DeleteMeasurementButton({
  clientId,
  measurementId,
}: {
  clientId: string;
  measurementId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Elimina rilevazione"
      disabled={pending}
      onClick={() => startTransition(() => deleteMeasurement(clientId, measurementId))}
      className="flex text-ink-faint disabled:opacity-40"
    >
      <Trash2 size={13} strokeWidth={2} />
    </button>
  );
}
