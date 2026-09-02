import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "muted";
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-[0.12em] font-medium rounded-sm",
        tone === "accent" && "bg-[var(--color-light)]/15 text-[var(--color-light)]",
        tone === "neutral" && "bg-white/8 text-[var(--color-text-muted)]",
        tone === "muted" && "border border-[var(--color-hairline)] text-[var(--color-text-subtle)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
