import { LogoutButton } from "./logout-button";
import { Logo } from "./brand/Logo";
import { ThemeToggle } from "./theme-toggle";

export function TopBar({ name, roleLabel }: { name: string; roleLabel: string }) {
  return (
    <header className="print:hidden mx-3 mt-3 flex items-center justify-between rounded-pill border border-line bg-surface px-5 py-3 sm:mx-5 sm:mt-4 sm:px-7">
      <div>
        <Logo variant="wordmark" size={28} />
        <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gold">{roleLabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-ink-soft sm:inline">{name}</span>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
