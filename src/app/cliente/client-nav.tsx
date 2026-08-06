"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Dumbbell, UtensilsCrossed, HeartPulse } from "lucide-react";

const TABS = [
  { href: "/cliente/ricette", label: "Ricette", icon: ChefHat },
  { href: "/cliente/allenamenti", label: "Allenamenti", icon: Dumbbell },
  { href: "/cliente/cena-fuori", label: "Cena fuori", icon: UtensilsCrossed },
  { href: "/cliente/salute", label: "I miei dati", icon: HeartPulse },
];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-5 sm:px-7">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${
              active ? "border-teal text-teal" : "border-transparent text-ink-faint"
            }`}
          >
            <Icon size={15} strokeWidth={2.2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
