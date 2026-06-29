import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-matrix-line bg-white p-4 shadow-soft", className)}>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const toneClass = {
    neutral: "text-matrix-ink",
    good: "text-matrix-green",
    bad: "text-matrix-red",
    warn: "text-matrix-amber",
  }[tone];

  return (
    <div className="rounded-lg border border-matrix-line bg-white p-3">
      <div className="text-xs font-medium text-matrix-muted">{label}</div>
      <div className={cn("mt-2 text-xl font-bold leading-tight", toneClass)}>{value}</div>
      {sub ? <div className="mt-1 text-xs leading-snug text-matrix-muted">{sub}</div> : null}
    </div>
  );
}

export function MetricRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-matrix-line py-2 last:border-b-0">
      <span className="min-w-0 text-sm text-matrix-muted">{label}</span>
      <span className={cn("text-right text-sm font-semibold text-matrix-ink", valueClassName)}>{value}</span>
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  description,
}: {
  title: string;
  action?: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold leading-tight text-matrix-ink">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-snug text-matrix-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
