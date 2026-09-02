import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-light)] text-[#1a1206] hover:brightness-110 border border-transparent",
  secondary:
    "bg-transparent text-[var(--color-text)] border border-[var(--color-hairline)] hover:border-[var(--color-light)]",
  ghost:
    "bg-transparent text-[var(--color-text-muted)] border border-transparent hover:text-[var(--color-text)]",
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  disabled,
  className,
  type = "button",
}: Props) {
  const classes = cn(
    // 44px min height keeps every action inside the mobile tap target (PWA-05).
    "inline-flex items-center justify-center gap-2 min-h-11 px-6 text-sm font-medium",
    "transition-all duration-[var(--duration-fast)] rounded-sm cursor-pointer",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    styles[variant],
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
