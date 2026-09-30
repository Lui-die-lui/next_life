import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-(--color-accent) text-(--color-accent-foreground) hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-(--color-surface) border border-(--color-border) text-(--color-text) hover:bg-(--color-surface-muted) disabled:opacity-50",
  danger:
    "bg-(--color-danger-soft) text-(--color-danger) hover:opacity-80 disabled:opacity-50",
  ghost: "text-(--color-text) hover:bg-(--color-surface-muted) disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}
