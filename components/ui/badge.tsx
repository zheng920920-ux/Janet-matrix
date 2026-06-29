import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "good" | "warn" | "bad" | "blue" | "violet";

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-matrix-line bg-white text-matrix-muted",
  good: "border-emerald-200 bg-emerald-50 text-matrix-green",
  warn: "border-amber-200 bg-amber-50 text-matrix-amber",
  bad: "border-orange-200 bg-orange-50 text-matrix-red",
  blue: "border-blue-200 bg-blue-50 text-matrix-blue",
  violet: "border-violet-200 bg-violet-50 text-matrix-violet",
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
