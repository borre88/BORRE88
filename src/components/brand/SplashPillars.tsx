"use client";
import { useEffect, useState } from "react";
import styles from "./SplashPillars.module.css";

const PILLARS = [
  { label: "Cardiovascolare", x: 150, y: 42, delay: 0.1, pos: { top: 8, left: "50%", transform: "translateX(-50%)" } },
  { label: "Sonno", x: 252.7, y: 116.6, delay: 0.22, pos: { top: 98, right: -8 } },
  { label: "Antropometria", x: 213.5, y: 237.4, delay: 0.34, pos: { bottom: 32, right: 2 } },
  { label: "Forza", x: 86.5, y: 237.4, delay: 0.46, pos: { bottom: 32, left: 12 } },
  { label: "Nutrizione", x: 47.3, y: 116.6, delay: 0.58, pos: { top: 98, left: -14 } },
];

/** Poligono interno: usa i punteggi reali del cliente (0–20) se disponibili. */
function scorePolygon(scores?: number[]) {
  const cx = 150,
    cy = 150,
    R = 108;
  const vals = scores?.length === 5 ? scores : [13, 16, 17, 14, 18];
  return vals
    .map((v, i) => {
      const a = -Math.PI / 2 + i * ((2 * Math.PI) / 5);
      const r = R * (v / 20);
      return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
    })
    .join(" ");
}

export function SplashPillars({
  scores,
  onDone,
  minDuration = 2600,
}: {
  scores?: number[];
  onDone?: () => void;
  minDuration?: number;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), minDuration);
    return () => clearTimeout(t);
  }, [minDuration]);

  return (
    <div
      className={`${styles.root} ${leaving ? styles.leaving : ""}`}
      onTransitionEnd={() => leaving && onDone?.()}
      aria-hidden="true"
    >
      <div className={styles.stage}>
        <svg viewBox="0 0 300 300" className={styles.svg}>
          <g stroke="rgba(201,161,67,.45)" strokeWidth="1" strokeDasharray="110" strokeLinecap="round">
            {PILLARS.map((p, i) => (
              <line
                key={i}
                x1="150"
                y1="150"
                x2={p.x}
                y2={p.y}
                className={styles.axis}
                style={{ animationDelay: `${p.delay}s` }}
              />
            ))}
          </g>
          <polygon
            points="150,42 252.7,116.6 213.5,237.4 86.5,237.4 47.3,116.6"
            fill="none"
            stroke="rgba(201,161,67,.28)"
            strokeWidth="1"
            className={styles.ring}
          />
          <polygon
            points={scorePolygon(scores)}
            fill="rgba(245,243,239,.1)"
            stroke="#F5F3EF"
            strokeWidth="2"
            strokeLinejoin="round"
            className={styles.poly}
          />
        </svg>

        <div className={styles.mark}>
          <svg width="86" height="86" viewBox="0 0 104 104">
            <rect width="104" height="104" rx="26" fill="#F5F3EF" />
            <rect x="7" y="7" width="90" height="90" rx="20" fill="none" stroke="#B08A2E" strokeWidth="1" />
            <text
              x="52"
              y="63"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="33"
              fontWeight="700"
              fill="#14564A"
            >
              N<tspan fill="#B08A2E">&amp;</tspan>P
            </text>
          </svg>
        </div>

        {PILLARS.map((p, i) => (
          <div
            key={i}
            className={styles.pillar}
            style={{ ...p.pos, animationDelay: `${p.delay + 0.2}s` } as React.CSSProperties}
          >
            {p.label}
          </div>
        ))}
      </div>

      <div className={styles.wordmark}>
        <div className={styles.name}>Nutrition &amp; Performance</div>
        <div className={styles.sub}>Dott. Simone Borrelli</div>
      </div>
    </div>
  );
}
