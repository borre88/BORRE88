"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const link = `${window.location.origin}/questionario/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-ink-soft hover:border-teal hover:text-teal"
    >
      {copied ? <Check size={14} strokeWidth={2.2} /> : <Copy size={14} strokeWidth={2.2} />}
      {copied ? "Copiato" : "Copia link"}
    </button>
  );
}
