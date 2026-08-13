import { SectionHeader } from "@/components/section-header";

const SUB_NAV = [
  { href: "/cliente/nutrizione/ricette", label: "Ricette" },
  { href: "/cliente/nutrizione/cena-fuori", label: "Cena fuori" },
  { href: "/cliente/nutrizione/cotto-crudo", label: "Cotto - Crudo" },
  { href: "/cliente/nutrizione/lista-della-spesa", label: "Lista della spesa" },
  { href: "/cliente/nutrizione/delivery", label: "Delivery a domicilio" },
];

export default function NutrizioneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionHeader title="Nutrizione" subNav={SUB_NAV} />
      {children}
    </div>
  );
}
