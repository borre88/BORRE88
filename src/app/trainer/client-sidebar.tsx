"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Users, User } from "lucide-react";
import { NewClientForm } from "./new-client-form";
import { DeleteClientButton } from "./delete-client-button";

interface ClientSummary {
  id: string;
  full_name: string;
}

export function ClientSidebar({ clients }: { clients: ClientSummary[] }) {
  const [showForm, setShowForm] = useState(false);
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-line bg-surface p-4 sm:w-60 sm:border-b-0 sm:border-r sm:p-5">
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

      {showForm && <NewClientForm onDone={() => setShowForm(false)} />}

      {clients.length === 0 && !showForm && (
        <div className="px-1 py-3 text-[12.5px] leading-relaxed text-ink-faint">
          Nessun cliente ancora.
          <br />
          Aggiungine uno per iniziare.
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto sm:flex-col sm:gap-0.5 sm:overflow-visible">
        {clients.map((c) => {
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
    </aside>
  );
}
