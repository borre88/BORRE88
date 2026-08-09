export function SectionIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-[28px] font-bold leading-tight">{title}</h1>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-faint">{subtitle}</p>
    </div>
  );
}

export function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
        muted ? "bg-gold-soft text-gold-ink" : "bg-teal-soft text-teal"
      }`}
    >
      {children}
    </span>
  );
}

export function MacroPill({ label, value, wide }: { label: string; value: string | number; wide?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 rounded-md bg-cream font-mono text-[11.5px] ${
        wide ? "px-3.5 py-1.5" : "px-2.5 py-0.5"
      }`}
    >
      <span className="font-body text-ink-faint">{label}</span>
      <span className="font-medium">
        {value}
        {typeof value === "number" ? "g" : ""}
      </span>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="py-8 text-center text-sm text-ink-faint">{text}</div>;
}

export interface ChipOption {
  key: string;
  label: React.ReactNode;
}

export function ChipGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (key: string) => void;
  options: ChipOption[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
            value === o.key
              ? "border-teal bg-teal text-white"
              : "border-line bg-surface text-ink-soft"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
