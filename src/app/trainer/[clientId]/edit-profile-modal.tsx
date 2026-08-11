"use client";

import { useState, useTransition } from "react";
import { User, X } from "lucide-react";
import { updateClientProfile } from "../actions";

interface ClientProfile {
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  group_name: string | null;
}

export function EditProfileModal({
  clientId,
  client,
  existingGroups = [],
}: {
  clientId: string;
  client: ClientProfile;
  existingGroups?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const missing = !client.phone || !client.date_of_birth || !client.gender;

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await updateClientProfile(clientId, undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
      }
    });
  }

  const inputClass =
    "w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-[13px] outline-none focus:border-teal";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium ${
          missing ? "border-gold bg-gold-soft text-gold-ink" : "border-line text-ink-soft"
        }`}
      >
        <User size={15} strokeWidth={2.2} />
        Profilo
        {missing && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-gold" />}
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
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gold">Profilo</div>
                <div className="font-display text-lg font-bold">Dati anagrafici</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="text-ink-soft">
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form action={action} className="overflow-y-auto px-5 py-4">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="full_name">
                Nome e cognome
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                defaultValue={client.full_name}
                className={`${inputClass} mb-3`}
              />

              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="phone">
                Telefono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={client.phone ?? ""}
                className={`${inputClass} mb-3`}
              />

              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="date_of_birth">
                Data di nascita
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                required
                defaultValue={client.date_of_birth ?? ""}
                className={`${inputClass} mb-3`}
              />

              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="gender">
                Sesso
              </label>
              <select
                id="gender"
                name="gender"
                required
                defaultValue={client.gender ?? ""}
                className={inputClass}
              >
                <option value="" disabled>
                  Seleziona
                </option>
                <option value="maschio">Maschio</option>
                <option value="femmina">Femmina</option>
              </select>

              <label className="mb-1 mt-3 block text-xs font-medium text-ink-soft" htmlFor="group_name">
                Gruppo
              </label>
              <input
                id="group_name"
                name="group_name"
                placeholder="Squadra, palestra, studio…"
                list="existing-groups-edit"
                defaultValue={client.group_name ?? ""}
                className={inputClass}
              />
              <datalist id="existing-groups-edit">
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>

              {error && <p className="mt-3 text-xs font-medium text-bad">{error}</p>}

              <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-line px-3.5 py-2 text-xs font-medium text-ink-soft"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {pending ? "Salvataggio…" : "Salva profilo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
