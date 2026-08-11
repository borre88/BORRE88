import { SectionHeader } from "@/components/section-header";

const SUB_NAV = [
  { href: "/cliente/valutazione", label: "I miei dati" },
  { href: "/cliente/valutazione/check-in", label: "Check-in" },
];

export default function ValutazioneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionHeader title="Valutazione" subNav={SUB_NAV} />
      {children}
    </div>
  );
}
