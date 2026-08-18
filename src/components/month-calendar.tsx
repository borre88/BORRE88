"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid, formatMonthLabel, toISODate } from "@/lib/dates";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function MonthCalendar({
  markedDates,
  selectedDate,
  onSelectDate,
}: {
  markedDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const grid = getMonthGrid(viewYear, viewMonth);
  const todayIso = toISODate(today);

  function changeMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Mese precedente"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:border-teal hover:text-teal"
        >
          <ChevronLeft size={16} strokeWidth={2.2} />
        </button>
        <div className="font-display text-sm font-bold">{formatMonthLabel(viewYear, viewMonth)}</div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Mese successivo"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:border-teal hover:text-teal"
        >
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === viewMonth;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          const hasMark = markedDates.has(iso);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={`relative aspect-square rounded-lg text-[12.5px] font-medium transition-colors ${
                isSelected
                  ? "bg-teal text-white"
                  : isToday
                    ? "border border-teal text-ink"
                    : inMonth
                      ? "text-ink hover:bg-teal-soft"
                      : "text-ink-faint/50 hover:bg-teal-soft"
              }`}
            >
              {d.getDate()}
              {hasMark && (
                <span
                  aria-hidden
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    isSelected ? "bg-white" : "bg-teal"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
