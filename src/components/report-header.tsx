import { Logo } from "@/components/brand/Logo";

export function ReportHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <Logo variant="wordmark" size={26} />
        <div className="pt-1 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">Dott. Simone Borrelli</div>
          <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-ink-faint">Biologo nutrizionista</div>
        </div>
      </div>
      <div className="mt-4 h-0.5 rounded-full bg-teal" />
    </div>
  );
}
