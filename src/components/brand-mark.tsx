const SIZES = {
  sm: "h-8 w-8 rounded-lg text-xs",
  md: "h-9 w-9 rounded-lg text-sm",
  lg: "h-12 w-12 rounded-xl text-lg",
} as const;

export function BrandMark({ size = "md" }: { size?: keyof typeof SIZES }) {
  return (
    <div
      className={`brand-mark flex shrink-0 items-center justify-center font-display font-bold text-white ${SIZES[size]}`}
    >
      N&P
    </div>
  );
}
