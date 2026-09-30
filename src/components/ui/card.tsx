import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border border-(--color-border) bg-(--color-surface) p-6 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 border-t border-(--color-border) py-10">
      <p className="text-lg font-semibold text-(--color-text)">{title}</p>
      {description && <p className="max-w-xl text-base text-(--color-text-muted)">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
