"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-white"
    >
      <Printer size={15} strokeWidth={2.2} />
      Scarica PDF
    </button>
  );
}
