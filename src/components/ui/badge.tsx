import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "solid" | "warn" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-(--color-border) bg-(--color-surface) text-(--color-text-muted)",
  accent: "border-(--color-line)/70 bg-transparent text-(--color-text)",
  solid: "border-transparent bg-(--color-accent) text-(--color-accent-foreground)",
  warn: "border-(--color-warn)/35 bg-(--color-warn-soft) text-(--color-warn)",
  danger: "border-(--color-danger)/35 bg-(--color-danger-soft) text-(--color-danger)",
};

/** Status is always conveyed by this text label, not by color alone. */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  size = "md",
}: {
  value: number | null;
  label?: string;
  size?: "sm" | "md";
}) {
  if (value === null) {
    return <p className="text-sm text-(--color-text-muted)">{label ?? "체크리스트 없음"}</p>;
  }
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "체크리스트 진행률"}
        className={`w-full overflow-hidden rounded-full bg-(--color-surface-muted) ${size === "sm" ? "h-1.5" : "h-2"}`}
      >
        <div className="h-full rounded-full bg-(--color-accent)" style={{ width: `${clamped}%` }} />
      </div>
      <span className="shrink-0 font-(family-name:--font-display) text-sm font-semibold tabular-nums">
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}
