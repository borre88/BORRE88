"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SplashPillars } from "@/components/brand/SplashPillars";

// Solo le pagine di atterraggio dopo il login: mai su una pagina aperta
// direttamente (es. il referto PDF in una scheda nuova).
const HOME_PATHS = new Set(["/trainer", "/cliente"]);

const listeners = new Set<() => void>();
let dismissed = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (dismissed) return false;
  if (sessionStorage.getItem("np_splash_seen")) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

function getServerSnapshot() {
  return false;
}

function dismiss() {
  dismissed = true;
  sessionStorage.setItem("np_splash_seen", "1");
  listeners.forEach((listener) => listener());
}

export function SplashGate({ children, scores }: { children: React.ReactNode; scores?: number[] }) {
  const pathname = usePathname();
  const eligible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const show = eligible && HOME_PATHS.has(pathname);

  return (
    <>
      {show && <SplashPillars scores={scores} onDone={dismiss} />}
      {children}
    </>
  );
}
