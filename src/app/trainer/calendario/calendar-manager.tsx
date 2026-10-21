"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarPlus, Check, Repeat, Trash2, X } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { MonthCalendar } from "@/components/month-calendar";
import { toISODate } from "@/lib/dates";
import {
  APPOINTMENT_TYPES,
  RECURRENCE_WEEK_OPTIONS,
  RECURRENCE_OCCURRENCE_OPTIONS,
  appointmentTypeAccent,
  appointmentTypeLabel,
  type AppointmentType,
} from "@/lib/appointments";
import { createAppointment, toggleAppointmentCompleted, deleteAppointment, deleteAppointmentSeries } from "./actions";

type Appointment = Tables<"client_appointments"> & { clients: { full_name: string } | null };
interface ClientOption {
  id: string;
  full_name: string;
}

function formatDayLabel(iso: string): string {
  const label = new Date(iso + "T00:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function AppointmentCard({
  appointment,
  showDate,
  pending,
  onToggle,
  onDelete,
  onDeleteSeries,
}: {
  appointment: Appointment;
  showDate?: boolean;
  pending: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onDeleteSeries: (seriesId: string) => void;
}) {
  const accent = appointmentTypeAccent(appointment.type);
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border px-3.5 py-3 ${
        appointment.completed ? "border-line bg-cream opacity-60" : `${accent.border} ${accent.bg}`
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggle(appointment.id, !appointment.completed)}
          aria-label={appointment.completed ? "Segna da fare" : "Segna come fatto"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border disabled:opacity-50 ${
            appointment.completed ? "border-good bg-good text-white" : "border-line bg-surface"
          }`}
        >
          {appointment.completed && <Check size={12} strokeWidth={2.6} />}
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent.bg} ${accent.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              {appointmentTypeLabel(appointment.type)}
            </span>
            {appointment.series_id && (
              <span className="inline-flex items-center gap-1 text-[10px] text-ink-faint">
                <Repeat size={11} strokeWidth={2.2} /> ricorrente
              </span>
            )}
            {showDate && (
              <span className={`text-[11px] font-medium ${appointment.date < toISODate(new Date()) && !appointment.completed ? "text-bad" : "text-ink-faint"}`}>
                {appointment.date < toISODate(new Date()) && !appointment.completed ? "scaduta · " : ""}
                {new Date(appointment.date + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>
          <div className={`mt-1 text-sm font-semibold ${appointment.completed ? "line-through text-ink-faint" : ""}`}>
            {appointment.clients?.full_name ?? "Cliente"}
          </div>
          <div className="text-xs text-ink-faint">{appointment.title}</div>
          {appointment.notes && <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{appointment.notes}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {appointment.series_id && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Eliminare tutta la serie ricorrente?")) onDeleteSeries(appointment.series_id!);
            }}
            aria-label="Elimina tutta la serie"
            title="Elimina tutta la serie"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:text-bad"
          >
            <Repeat size={13} strokeWidth={2.2} />
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => onDelete(appointment.id)}
          aria-label="Elimina"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint hover:text-bad"
        >
          <Trash2 size={13} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export function CalendarManager({ clients, appointments }: { clients: ClientOption[]; appointments: Appointment[] }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [type, setType] = useState<AppointmentType>("visita");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);
  const [occurrences, setOccurrences] = useState(6);

  const markedDates = useMemo(() => new Set(appointments.map((a) => a.date)), [appointments]);

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === selected).sort((a, b) => a.title.localeCompare(b.title)),
    [appointments, selected]
  );

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => !a.completed)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 12),
    [appointments]
  );

  function startCreate() {
    setClientId(clients[0]?.id ?? "");
    setType("visita");
    setTitle("");
    setNotes("");
    setRecurring(false);
    setRecurrenceWeeks(4);
    setOccurrences(6);
    setError(null);
    setCreating(true);
  }

  function save() {
    startTransition(async () => {
      const result = await createAppointment({
        clientId,
        type,
        title: title || appointmentTypeLabel(type),
        date: selected,
        notes: notes || null,
        recurrenceWeeks: recurring ? recurrenceWeeks : null,
        occurrences: recurring ? occurrences : 1,
      });
      if (result?.error) setError(result.error);
      else {
        setCreating(false);
        setError(null);
      }
    });
  }

  function toggle(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleAppointmentCompleted(id, completed);
    });
  }

  function remove(id: string) {
    if (!confirm("Eliminare questa scadenza?")) return;
    startTransition(async () => {
      await deleteAppointment(id);
    });
  }

  function removeSeries(seriesId: string) {
    startTransition(async () => {
      await deleteAppointmentSeries(seriesId);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <MonthCalendar markedDates={markedDates} selectedDate={selected} onSelectDate={setSelected} />
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wide text-gold">Prossime scadenze</div>
          {upcoming.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">Nessuna scadenza in programma.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  showDate
                  pending={pending}
                  onToggle={toggle}
                  onDelete={remove}
                  onDeleteSeries={removeSeries}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gold">{formatDayLabel(selected)}</div>
          {!creating && (
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-white"
            >
              <CalendarPlus size={13} strokeWidth={2.2} />
              Nuova scadenza
            </button>
          )}
        </div>

        {!creating && dayAppointments.length === 0 && (
          <p className="py-6 text-center text-[12.5px] text-ink-faint">Nessuna scadenza per questo giorno.</p>
        )}

        {!creating && dayAppointments.length > 0 && (
          <div className="space-y-2">
            {dayAppointments.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                pending={pending}
                onToggle={toggle}
                onDelete={remove}
                onDeleteSeries={removeSeries}
              />
            ))}
          </div>
        )}

        {creating && (
          <div>
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="ap-client">
                Cliente
              </label>
              <select
                id="ap-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <span className="mb-1 block text-xs font-medium text-ink-soft">Tipo</span>
              <div className="flex flex-wrap gap-1.5">
                {APPOINTMENT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      type === t.key ? "border-teal bg-teal text-white" : "border-line bg-surface text-ink-soft"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="ap-title">
                Titolo (facoltativo)
              </label>
              <input
                id="ap-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={appointmentTypeLabel(type)}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="ap-date">
                Data
              </label>
              <input
                id="ap-date"
                type="date"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft" htmlFor="ap-notes">
                Note (facoltativo)
              </label>
              <textarea
                id="ap-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-line bg-cream px-2.5 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-3.5 rounded-lg border border-line bg-cream p-3">
              <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                Ripeti periodicamente
              </label>
              {recurring && (
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="ap-weeks">
                      Ogni quante settimane
                    </label>
                    <select
                      id="ap-weeks"
                      value={recurrenceWeeks}
                      onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                      className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-teal"
                    >
                      {RECURRENCE_WEEK_OPTIONS.map((w) => (
                        <option key={w} value={w}>
                          {w} {w === 1 ? "settimana" : "settimane"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] font-medium text-ink-faint" htmlFor="ap-occurrences">
                      Quante volte
                    </label>
                    <select
                      id="ap-occurrences"
                      value={occurrences}
                      onChange={(e) => setOccurrences(Number(e.target.value))}
                      className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-teal"
                    >
                      {RECURRENCE_OCCURRENCE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} volte
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="mb-3 text-xs font-medium text-bad">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending || !clientId}
                onClick={save}
                className="rounded-lg bg-teal px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {pending ? "Salvataggio…" : "Salva scadenza"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex items-center gap-1 rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-soft"
              >
                <X size={13} strokeWidth={2.2} />
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
