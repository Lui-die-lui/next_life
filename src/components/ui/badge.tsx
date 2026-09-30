import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "warn" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-(--color-surface-muted) text-(--color-text-muted)",
  accent: "bg-(--color-accent-soft) text-(--color-accent)",
  warn: "bg-(--color-warn-soft) text-(--color-warn)",
  danger: "bg-(--color-danger-soft) text-(--color-danger)",
};

/** Status is always conveyed by this text label, not by color alone. */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number | null; label?: string }) {
  if (value === null) {
    return <p className="text-xs text-(--color-text-muted)">{label ?? "진행률 미설정"}</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-muted)">
        <div
          className="h-full rounded-full bg-(--color-accent)"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="text-xs text-(--color-text-muted)">{label ?? `${value}%`}</p>
    </div>
  );
}
