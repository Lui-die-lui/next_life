"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowMark } from "./button";

/**
 * Screen title block shared by every app and demo screen: a large title on
 * the left, the screen's primary action on the right, and a strong rule
 * underneath (the reference's "All Works" header).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  arrow = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  arrow?: boolean;
}) {
  return (
    <header className="border-b border-(--color-line) pb-8 pt-10 sm:pb-10 sm:pt-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4">
          {eyebrow ? <div className="nl-eyebrow">{eyebrow}</div> : null}
          <h1 className="nl-page-title text-(--color-text)">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-base text-(--color-text-muted) sm:text-lg">{description}</p>
          ) : null}
        </div>
        {actions || arrow ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pb-2">
            {arrow ? <ArrowMark className="hidden text-(--color-text) lg:block" /> : null}
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** Heading row for a section inside a screen (title + optional action). */
export function SectionHeader({
  title,
  count,
  description,
  action,
}: {
  title: ReactNode;
  count?: number;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-(--color-line) pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h2 className="nl-section-title flex items-baseline gap-3 text-(--color-text)">
          {title}
          {typeof count === "number" ? (
            <span className="font-(family-name:--font-display) text-lg font-medium tracking-normal text-(--color-text-subtle)">
              {count}
            </span>
          ) : null}
        </h2>
        {description ? <p className="text-base text-(--color-text-muted)">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

/**
 * Right-hand side panel built on the native <dialog> (focus trap, Esc to
 * close and inert background come from the platform). Used for reading a
 * long record or filling a form without leaving the list.
 */
export function SidePanel({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="nl-panel"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (e.target === ref.current) onClose();
      }}
    >
      {open ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-(--color-line) px-6 pb-5 pt-6 sm:px-10 sm:pt-8">
            <div className="flex min-w-0 flex-col gap-2">
              {eyebrow ? <div className="nl-eyebrow">{eyebrow}</div> : null}
              <h2 className="nl-row-title text-(--color-text)">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-(--color-text) hover:bg-(--color-surface-muted)"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">{children}</div>
          {footer ? <div className="border-t border-(--color-border) px-6 py-4 sm:px-10">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

/** Label + long text pair for read-only records. */
export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-sm font-semibold text-(--color-text-subtle)">{label}</dt>
      <dd className="whitespace-pre-wrap text-base leading-relaxed text-(--color-text)">{children}</dd>
    </div>
  );
}
