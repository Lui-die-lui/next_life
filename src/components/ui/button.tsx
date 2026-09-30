import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Glass pair, matching the landing hero CTAs: dark frosted primary and a
  // light frosted secondary with a soft border.
  primary:
    "border border-white/15 bg-(--color-accent)/85 text-(--color-accent-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_-12px_rgba(36,35,32,0.4)] backdrop-blur-md hover:bg-(--color-accent)/95 disabled:opacity-45",
  secondary:
    "border border-(--color-border) bg-(--color-bg)/40 text-(--color-text) shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md hover:bg-(--color-surface-muted)/70 disabled:opacity-45",
  danger:
    "border border-(--color-danger)/40 bg-transparent text-(--color-danger) hover:bg-(--color-danger-soft) disabled:opacity-45",
  ghost: "text-(--color-text) hover:bg-(--color-surface-muted) disabled:opacity-45",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button {...props} className={buttonClass(variant, size, className)} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...props} className={buttonClass(variant, size, className)} />;
}

/** The reference's long thin arrow: a decorative "go" mark beside section titles. */
export function ArrowMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 32" fill="none" className={`h-6 w-24 sm:h-8 sm:w-28 ${className}`}>
      <path d="M1 30.5h118L94 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
