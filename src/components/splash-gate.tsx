"use client";

import { useSyncExternalStore } from "react";
import { SplashPillars } from "@/components/brand/SplashPillars";

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
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <>
      {show && <SplashPillars scores={scores} onDone={dismiss} />}
      {children}
    </>
  );
}
