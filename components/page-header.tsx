import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  meta,
  action,
  className,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex items-end justify-between gap-6", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-7 tracking-tight text-matrix-ink">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-5 text-matrix-muted">{description}</p> : null}
      </div>
      {meta || action ? (
        <div className="flex shrink-0 items-center gap-3 text-right text-xs leading-5 text-matrix-muted">
          {meta}
          {action}
        </div>
      ) : null}
    </section>
  );
}
