"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function SectionHeader({
  title,
  subNav,
}: {
  title: string;
  subNav?: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="print:hidden mb-5">
      <Link
        href="/cliente"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-teal"
      >
        <ArrowLeft size={14} strokeWidth={2.2} />
        Tutte le aree
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2.5">
        <h1 className="font-display text-lg font-bold">{title}</h1>
        {subNav && (
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {subNav.map((s) => {
              const active = pathname === s.href;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`no-lift whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium ${
                    active ? "bg-teal text-white" : "bg-cream text-ink-soft"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
