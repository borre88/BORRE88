"use client";

import { useState } from "react";
import { Download, X, Share, MoreVertical } from "lucide-react";

type Platform = "ios" | "android";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "ios";
  return /android/i.test(navigator.userAgent) ? "android" : "ios";
}

export function InstallAppModal() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("ios");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPlatform(detectPlatform());
          setOpen(true);
        }}
        aria-label="Installa l'app sul telefono"
        className="no-lift flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft hover:border-teal hover:text-teal"
      >
        <Download size={15} strokeWidth={2.2} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-surface"
          >
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">App</div>
                <div className="font-display text-lg font-bold">Aggiungi alla schermata Home</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="text-ink-soft">
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <p className="mb-4 text-[12.5px] leading-relaxed text-ink-faint">
                Puoi installare l&apos;app sul telefono come se fosse scaricata dallo store: apparirà con la sua
                icona e si aprirà a schermo intero, senza la barra del browser.
              </p>

              <div className="mb-4 flex gap-1.5 rounded-lg bg-cream p-1">
                <button
                  type="button"
                  onClick={() => setPlatform("ios")}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    platform === "ios" ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
                  }`}
                >
                  iPhone
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("android")}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    platform === "android" ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
                  }`}
                >
                  Android
                </button>
              </div>

              {platform === "ios" ? (
                <ol className="space-y-3">
                  <Step n={1}>
                    Apri il sito da <span className="font-semibold">Safari</span> (non funziona da Chrome o
                    Instagram).
                  </Step>
                  <Step n={2}>
                    Tocca l&apos;icona <Share size={13} strokeWidth={2.2} className="inline align-text-bottom" />{" "}
                    <span className="font-semibold">Condividi</span> in basso al centro.
                  </Step>
                  <Step n={3}>
                    Scorri e tocca <span className="font-semibold">&quot;Aggiungi alla schermata Home&quot;</span>.
                  </Step>
                  <Step n={4}>
                    Conferma con <span className="font-semibold">&quot;Aggiungi&quot;</span> in alto a destra.
                  </Step>
                </ol>
              ) : (
                <ol className="space-y-3">
                  <Step n={1}>
                    Apri il sito da <span className="font-semibold">Chrome</span>.
                  </Step>
                  <Step n={2}>
                    Tocca i tre puntini{" "}
                    <MoreVertical size={13} strokeWidth={2.2} className="inline align-text-bottom" /> in alto a
                    destra.
                  </Step>
                  <Step n={3}>
                    Tocca <span className="font-semibold">&quot;Aggiungi a schermata Home&quot;</span> o{" "}
                    <span className="font-semibold">&quot;Installa app&quot;</span>.
                  </Step>
                  <Step n={4}>
                    Conferma con <span className="font-semibold">&quot;Aggiungi&quot;</span> /{" "}
                    <span className="font-semibold">&quot;Installa&quot;</span>.
                  </Step>
                </ol>
              )}

              <div className="mt-5 flex justify-end border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-teal px-4 py-2 text-xs font-medium text-white"
                >
                  Ho capito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[11px] font-semibold text-teal">
        {n}
      </span>
      <span className="text-[13px] leading-relaxed text-ink">{children}</span>
    </li>
  );
}
