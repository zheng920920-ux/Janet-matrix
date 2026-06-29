import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-matrix-ink text-white active:bg-black",
  secondary: "border border-matrix-line bg-white text-matrix-ink active:bg-matrix-paper",
  ghost: "text-matrix-muted active:bg-matrix-paper",
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matrix-blue",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
