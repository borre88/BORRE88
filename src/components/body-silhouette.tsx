import type { Gender } from "@/lib/health-score";

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
      viewBox="0 0 100 150"
      className={className}
      role="img"
      aria-label={isMale ? "Figura maschile" : "Figura femminile"}
    >
      <circle cx="50" cy="16" r="12" />
      {isMale ? (
        <>
          <path d="M32,32 L68,32 L64,92 L36,92 Z" />
          <path d="M36,92 L48,92 L45,146 L31,146 Z" />
          <path d="M52,92 L64,92 L69,146 L55,146 Z" />
        </>
      ) : (
        <path d="M40,32 L60,32 L86,140 L14,140 Z" />
      )}
    </svg>
  );
}
