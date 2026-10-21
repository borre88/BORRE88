"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, Stethoscope } from "lucide-react";

interface ClientOption {
  id: string;
  full_name: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const NON_CLIENT_SEGMENTS = new Set(["alimenti", "questionari"]);

function resolveClientIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/trainer\/([^/]+)/);
  if (!match) return null;
  const segment = match[1];
  if (NON_CLIENT_SEGMENTS.has(segment)) return null;
  return segment;
}

export function AIAssistant({ clients }: { clients: ClientOption[] }) {
  const pathname = usePathname();
  const clientId = resolveClientIdFromPath(pathname);
  const client = clients.find((c) => c.id === clientId) ?? null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [clientId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(nextMessages: ChatMessage[]) {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/diet-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, messages: nextMessages }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Errore dell'assistente.");
        return;
      }
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  function analyze() {
    const next: ChatMessage[] = [{ role: "user", content: "Analizza questo piano alimentare." }];
    setMessages(next);
    send(next);
  }

  function submitMessage() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next);
    setInput("");
    send(next);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistente AI"
        className="no-lift fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-teal text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={20} strokeWidth={2.2} /> : <Sparkles size={20} strokeWidth={2.2} />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex max-h-[70vh] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="flex items-center gap-2 border-b border-line bg-teal-soft px-4 py-3">
            <Stethoscope size={16} strokeWidth={2.2} className="text-teal" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-teal">Assistente nutrizionale AI</div>
              <div className="truncate text-[11px] text-ink-faint">
                {client ? `Cliente: ${client.full_name}` : "Apri la scheda di un cliente per iniziare"}
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
            {!client && (
              <p className="px-1 text-[12.5px] text-ink-faint">
                Vai su un cliente con un piano alimentare attivo per farmelo controllare: alimenti in conflitto con
                allergie e intolleranze, coerenza con i target di kcal e macro, varietà degli alimenti.
              </p>
            )}
            {client && messages.length === 0 && (
              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="w-full rounded-lg bg-teal px-3.5 py-2.5 text-xs font-medium text-white disabled:opacity-60"
              >
                Analizza piano attivo
              </button>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                    m.role === "user" ? "bg-teal text-white" : "border border-line bg-cream text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-line bg-cream px-3 py-2 text-[12.5px] text-ink-faint">
                  Sto controllando il piano…
                </div>
              </div>
            )}
            {error && <p className="px-1 text-[11.5px] font-medium text-bad">{error}</p>}
          </div>

          <div className="flex items-center gap-1.5 border-t border-line px-3 py-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) submitMessage();
              }}
              disabled={!client || loading}
              placeholder={client ? "Fai una domanda di follow-up…" : "Seleziona prima un cliente"}
              className="flex-1 rounded-full border border-line bg-cream px-3.5 py-2 text-[12.5px] outline-none focus:border-teal disabled:opacity-60"
            />
            <button
              type="button"
              onClick={submitMessage}
              disabled={!client || loading || !input.trim()}
              aria-label="Invia"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-white disabled:opacity-40"
            >
              <Send size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
