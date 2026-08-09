"use client";

import { useEffect } from "react";
import { markCheckinsSeen } from "../actions";

export function MarkCheckinsSeen({ clientId }: { clientId: string }) {
  useEffect(() => {
    markCheckinsSeen(clientId);
  }, [clientId]);

  return null;
}
