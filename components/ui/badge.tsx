import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "good" | "warn" | "bad" | "blue" | "violet";

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-matrix-line bg-white text-matrix-muted",
  good: "border-matrix-line bg-white text-matrix-muted",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  bad: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-matrix-line bg-gray-50 text-matrix-muted",
  violet: "border-matrix-line bg-gray-50 text-matrix-muted",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center rounded-md border px-2 text-xs font-medium leading-none",
        toneClass[tone],
        className,
      )}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}
