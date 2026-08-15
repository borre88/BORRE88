import type { Gender } from "@/lib/health-score";
import type { CSSProperties } from "react";

export function BodySilhouette({
  gender,
  className,
}: {
  gender: Gender | null;
  className?: string;
}) {
  const isMale = gender === "maschio";
  const src = isMale ? "/silhouettes/maschio.png" : "/silhouettes/femmina.png";

  const maskStyle: CSSProperties = {
    display: "inline-block",
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return (
    <span
      role="img"
      aria-label={isMale ? "Figura maschile" : "Figura femminile"}
      className={className}
      style={maskStyle}
    />
  );
}
