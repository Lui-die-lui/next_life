import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-muted) p-8 text-center">
      <p className="font-medium text-(--color-text)">{title}</p>
      {description && <p className="mt-1 text-sm text-(--color-text-muted)">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
