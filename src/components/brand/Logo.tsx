type Variant = "icon" | "wordmark" | "signature";
type Theme = "light" | "dark" | "onBrand" | "mono";

const C = {
  light: { bg: "#14564A", rule: "#B08A2E", ink: "#F5F3EF", amp: "#C9A143" },
  dark: { bg: "#111110", rule: "#C9A143", ink: "#F5F3EF", amp: "#C9A143" },
  onBrand: { bg: "#F5F3EF", rule: "#B08A2E", ink: "#14564A", amp: "#B08A2E" },
  mono: { bg: "none", rule: "#1C1C1A", ink: "#1C1C1A", amp: "#1C1C1A" },
};

export function Logo({
  variant = "icon",
  theme = "light",
  size = 40,
  className,
}: {
  variant?: Variant;
  theme?: Theme;
  size?: number;
  className?: string;
}) {
  const c = C[theme];

  if (variant === "icon") {
    // sotto i 20px la "&" collassa: resta la sola N
    const small = size < 20;
    return (
      <svg width={size} height={size} viewBox="0 0 104 104" className={className} role="img" aria-label="Nutrition & Performance">
        <rect
          width="104"
          height="104"
          rx="26"
          fill={c.bg === "none" ? "none" : c.bg}
          stroke={c.bg === "none" ? c.ink : "none"}
          strokeWidth={c.bg === "none" ? 3 : 0}
        />
        {!small && <rect x="7" y="7" width="90" height="90" rx="20" fill="none" stroke={c.rule} strokeWidth="1" />}
        {small ? (
          <text x="52" y="72" textAnchor="middle" fontFamily="var(--font-display)" fontSize="56" fontWeight="700" fill={c.ink}>
            N
          </text>
        ) : (
          <text
            x="52"
            y="63"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="34"
            fontWeight="700"
            fill={c.ink}
            letterSpacing="-1"
          >
            N<tspan fill={c.amp}>&amp;</tspan>P
          </text>
        )}
      </svg>
    );
  }

  if (variant === "wordmark") {
    const stroke = theme === "mono" ? "#1C1C1A" : theme === "dark" || theme === "onBrand" ? "#F5F3EF" : "#14564A";
    const trace = theme === "mono" ? "#1C1C1A" : "#C9A143";
    return (
      <div className={`flex items-center gap-4 ${className ?? ""}`}>
        <svg width={size * 1.45} height={size} viewBox="0 0 150 104" role="img" aria-label="Nutrition & Performance">
          <path d="M22 76 L22 28 L58 76 L58 28" fill="none" stroke={stroke} strokeWidth="7" strokeLinecap="square" />
          <path
            d="M78 76 L78 28 L100 28 A15 15 0 0 1 100 58 L78 58"
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="square"
          />
          <path
            d="M14 90 L44 90 L52 78 L60 100 L70 84 L136 84"
            fill="none"
            stroke={trace}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="border-l border-line pl-4 font-display font-bold leading-[1.15] tracking-[-0.01em]"
          style={{ fontSize: size * 0.32, color: stroke }}
        >
          Nutrition &amp;
          <br />
          Performance
        </div>
      </div>
    );
  }

  // signature — referti, PDF, email, biglietto
  return (
    <div className={`text-center ${className ?? ""}`}>
      <div className="font-display font-bold tracking-[-0.02em] text-ink" style={{ fontSize: size * 0.55 }}>
        nutrition<span className="text-gold">&amp;</span>performance
      </div>
      <div className="my-3 h-px bg-[#D8D3C7]" />
      <div className="font-ui text-[9px] font-semibold uppercase tracking-[0.26em] text-[#5A564D]">
        Dott. Simone Borrelli
      </div>
      <div className="font-ui mt-[5px] text-[9px] font-medium uppercase tracking-[0.14em] text-muted">
        Biologo nutrizionista
      </div>
    </div>
  );
}
