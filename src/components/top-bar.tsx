import { LogoutButton } from "./logout-button";

export function TopBar({ name, roleLabel }: { name: string; roleLabel: string }) {
  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-2.5 sm:px-7">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal font-display text-xs font-bold text-white">
          N&P
        </div>
        <div>
          <div className="font-display text-sm font-semibold leading-tight">Nutrition &amp; Performance</div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gold">{roleLabel}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-ink-soft sm:inline">{name}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
