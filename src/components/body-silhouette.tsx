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

const mirror = (points: Point[]): Point[] => points.map(([x, y]) => [100 - x, y]);

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

const TORSO = {
  maschio: [
    [24, 42],
    [19, 55],
    [21, 72],
    [27, 95],
    [29, 115],
    [31, 148],
    [69, 148],
    [71, 115],
    [73, 95],
    [79, 72],
    [81, 55],
    [76, 42],
    [50, 36],
  ] as Point[],
  femmina: [
    [28, 44],
    [23, 58],
    [24, 72],
    [28, 98],
    [24, 118],
    [25, 148],
    [75, 148],
    [76, 118],
    [72, 98],
    [76, 72],
    [77, 58],
    [72, 44],
    [50, 38],
  ] as Point[],
};

const ARM_LEFT = {
  maschio: [
    [22, 44],
    [16, 70],
    [15, 110],
    [17, 165],
    [23, 165],
    [22, 110],
    [23, 72],
    [27, 50],
  ] as Point[],
  femmina: [
    [26, 46],
    [21, 68],
    [20, 108],
    [22, 162],
    [27, 162],
    [26, 108],
    [26, 72],
    [30, 52],
  ] as Point[],
};

const LEG_LEFT = {
  maschio: [
    [31, 148],
    [27, 180],
    [24, 220],
    [22, 260],
    [21, 285],
    [19, 296],
    [38, 296],
    [36, 285],
    [35, 255],
    [38, 210],
    [46, 150],
  ] as Point[],
  femmina: [
    [28, 148],
    [25, 180],
    [22, 218],
    [21, 258],
    [20, 284],
    [18, 296],
    [36, 296],
    [34, 284],
    [33, 254],
    [35, 208],
    [44, 150],
  ] as Point[],
};

export function BodySilhouette({
  gender,
  className,
}: {
  gender: Gender | null;
  className?: string;
}) {
  const isMale = gender === "maschio";
  const key = isMale ? "maschio" : "femmina";

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

      <path d={smoothClosedPath(TORSO[key])} />
      <path d={smoothClosedPath(ARM_LEFT[key])} />
      <path d={smoothClosedPath(mirror(ARM_LEFT[key]))} />
      <path d={smoothClosedPath(LEG_LEFT[key])} />
      <path d={smoothClosedPath(mirror(LEG_LEFT[key]))} />
    </svg>
  );
}
