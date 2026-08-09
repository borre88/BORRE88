"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? "Attiva tema chiaro" : "Attiva tema scuro"}
      className="no-lift flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft hover:border-teal hover:text-teal"
    >
      {dark ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2.2} />}
    </button>
  );
}
