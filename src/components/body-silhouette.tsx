import type { Gender } from "@/lib/health-score";

type Point = [number, number];

/** Smooth closed outline through a loop of points (curve passes through each edge midpoint). */
function smoothClosedPath(points: Point[]): string {
  const n = points.length;
  const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[n - 1], points[0]);
  const d = [`M ${start[0]},${start[1]}`];
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const next = points[(i + 1) % n];
    const m = mid(p, next);
    d.push(`Q ${p[0]},${p[1]} ${m[0]},${m[1]}`);
  }
  d.push("Z");
  return d.join(" ");
}

// Bob-length hair, wider at ear level and tapering back in toward the neck.
const HAIR_OUTLINE: Point[] = [
  [50, 2],
  [64, 6],
  [70, 18],
  [70, 30],
  [64, 40],
  [56, 44],
  [50, 40],
  [44, 44],
  [36, 40],
  [30, 30],
  [30, 18],
  [36, 6],
];

export function BodySilhouette({
  gender,
  className,
}: {
  gender: Gender | null;
  className?: string;
}) {
  const isMale = gender === "maschio";

  return (
    <svg
      viewBox="0 0 100 300"
      className={className}
      role="img"
      aria-label={isMale ? "Figura maschile" : "Figura femminile"}
    >
      {isMale ? <circle cx="50" cy="19" r="14" /> : <path d={smoothClosedPath(HAIR_OUTLINE)} />}
      {!isMale && <circle cx="50" cy="21" r="13" />}

      <path d="M42,28 L58,28 L60,42 L40,42 Z" />

      <path
        d={
          isMale
            ? "M22,44 C18,50 16,56 18,60 C20,72 24,84 26,95 C24,104 26,110 28,118 C29,130 29,140 30,148 L70,148 C71,140 71,130 72,118 C74,110 76,104 74,95 C76,84 80,72 82,60 C84,56 82,50 78,44 C68,37 58,34 50,34 C42,34 32,37 22,44 Z"
            : "M28,46 C24,51 22,56 24,62 C25,75 27,85 28,95 C22,105 22,112 24,120 C25,132 25,140 26,148 L74,148 C75,140 75,132 76,120 C78,112 78,105 72,95 C73,85 75,75 76,62 C78,56 76,51 72,46 C64,40 56,38 50,38 C44,38 36,40 28,46 Z"
        }
      />

      <path d={isMale ? "M20,46 L15,90 L17,168 L23,168 L24,100 L26,58 Z" : "M25,48 L21,92 L23,166 L28,166 L28,100 L29,60 Z"} />
      <path
        d={isMale ? "M80,46 L85,90 L83,168 L77,168 L76,100 L74,58 Z" : "M75,48 L79,92 L77,166 L72,166 L72,100 L71,60 Z"}
      />

      <path
        d={
          isMale
            ? "M30,148 L25,278 L20,296 L38,296 L38,278 L47,150 Z"
            : "M28,148 L24,276 L19,296 L37,296 L36,276 L45,150 Z"
        }
      />
      <path
        d={
          isMale
            ? "M70,148 L75,278 L80,296 L62,296 L62,278 L53,150 Z"
            : "M72,148 L76,276 L81,296 L63,296 L64,276 L55,150 Z"
        }
      />
    </svg>
  );
}
