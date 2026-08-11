"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Users, User, Search, ChevronDown, ChevronUp } from "lucide-react";
import { NewClientForm } from "./new-client-form";
import { DeleteClientButton } from "./delete-client-button";

interface ClientSummary {
  id: string;
  full_name: string;
  group_name: string | null;
}

const UNGROUPED = "__ungrouped__";

export function ClientSidebar({ clients }: { clients: ClientSummary[] }) {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  const existingGroups = useMemo(
    () =>
      Array.from(new Set(clients.map((c) => c.group_name).filter((g): g is string => !!g))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [clients]
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? clients.filter((c) => c.full_name.toLowerCase().includes(q)) : clients;

    const byGroup = new Map<string, ClientSummary[]>();
    for (const c of filtered) {
      const key = c.group_name ?? UNGROUPED;
      const list = byGroup.get(key) ?? [];
      list.push(c);
      byGroup.set(key, list);
    }

    const keys = Array.from(byGroup.keys()).sort((a, b) => {
      if (a === UNGROUPED) return 1;
      if (b === UNGROUPED) return -1;
      return a.localeCompare(b);
    });

    return keys.map((key) => ({ key, label: key === UNGROUPED ? "Senza gruppo" : key, clients: byGroup.get(key)! }));
  }, [clients, query]);

  const showGroupHeaders = groups.length > 1 || (groups.length === 1 && groups[0].key !== UNGROUPED);

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <aside className="print:hidden w-full shrink-0 border-b border-line bg-surface p-4 sm:w-64 sm:border-b-0 sm:border-r sm:p-5">
      <div className="mb-2 flex items-center justify-between text-[10.5px] font-semibold tracking-wide text-ink-faint">
        <span className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={2.2} /> CLIENTI
        </span>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          aria-label="Nuovo cliente"
          className="flex items-center justify-center p-0.5 text-ink-soft"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      {showForm && <NewClientForm onDone={() => setShowForm(false)} existingGroups={existingGroups} />}

      {clients.length === 0 && !showForm && (
        <div className="px-1 py-3 text-[12.5px] leading-relaxed text-ink-faint">
          Nessun cliente ancora.
          <br />
          Aggiungine uno per iniziare.
        </div>
      )}

      {clients.length > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-line bg-cream px-2.5 py-1.5">
          <Search size={13} strokeWidth={2} className="shrink-0 text-ink-faint" />
          <input
            placeholder="Cerca per cognome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-none bg-transparent text-[13px] outline-none"
          />
        </div>
      )}

      {query && groups.length === 0 && (
        <div className="px-1 py-2 text-[12px] text-ink-faint">Nessun cliente trovato.</div>
      )}

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.key);
          return (
            <div key={group.key}>
              {showGroupHeaders && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="mb-1 flex w-full items-center justify-between px-1 py-0.5 text-left"
                >
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
                    {group.label} <span className="text-ink-faint/70">· {group.clients.length}</span>
                  </span>
                  {isCollapsed ? (
                    <ChevronDown size={12} strokeWidth={2.2} className="text-ink-faint" />
                  ) : (
                    <ChevronUp size={12} strokeWidth={2.2} className="text-ink-faint" />
                  )}
                </button>
              )}

              {!isCollapsed && (
                <div className="flex gap-1.5 overflow-x-auto sm:flex-col sm:gap-0.5 sm:overflow-visible">
                  {group.clients.map((c) => {
                    const href = `/trainer/${c.id}`;
                    const active = pathname === href;
                    return (
                      <Link
                        key={c.id}
                        href={href}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-[13.5px] sm:shrink ${
                          active ? "bg-teal-soft" : ""
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft">
                          <User size={13} strokeWidth={2.2} />
                        </span>
                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.full_name}</span>
                        <DeleteClientButton clientId={c.id} name={c.full_name} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
