import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { Logo } from "./brand/Logo";
import { ThemeToggle } from "./theme-toggle";
import { InstallAppModal } from "./install-app-modal";

export function TopBar({
  name,
  roleLabel,
  showInstallHint,
  guidaHref,
}: {
  name: string;
  roleLabel: string;
  showInstallHint?: boolean;
  guidaHref?: string;
}) {
  return (
    <header className="print:hidden mx-3 mt-3 flex items-center justify-between rounded-pill border border-line bg-surface px-5 py-3 sm:mx-5 sm:mt-4 sm:px-7">
      <div>
        <Logo variant="wordmark" size={28} />
        <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gold">{roleLabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-ink-soft sm:inline">{name}</span>
        {guidaHref && (
          <Link
            href={guidaHref}
            aria-label="Guida all'app"
            title="Guida all'app"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:border-teal hover:text-teal"
          >
            <BookOpen size={15} strokeWidth={2.2} />
          </Link>
        )}
        {showInstallHint && <InstallAppModal />}
        <Link
          href="/privacy"
          target="_blank"
          aria-label="Informativa privacy"
          title="Informativa privacy"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:border-teal hover:text-teal"
        >
          <ShieldCheck size={15} strokeWidth={2.2} />
        </Link>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
