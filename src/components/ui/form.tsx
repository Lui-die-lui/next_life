"use client";

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-base text-(--color-text) placeholder:text-(--color-text-subtle) transition-colors focus:border-(--color-line) focus:outline-none focus:ring-4 focus:ring-(--color-accent-soft) disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[15px] font-semibold text-(--color-text)">
        {label}
        {required ? (
          <span className="ml-1.5 text-(--color-danger)" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-(--color-text-muted)">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} h-12 py-0 ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${fieldBase} resize-y leading-relaxed ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} h-12 py-0 ${props.className ?? ""}`} />;
}

export function Checkbox({
  label,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-base text-(--color-text)">
      <input
        type="checkbox"
        {...props}
        className="mt-[3px] h-5 w-5 shrink-0 cursor-pointer accent-(--color-accent) disabled:cursor-not-allowed"
      />
      <span className="flex flex-col">
        <span>{label}</span>
        {description ? <span className="text-sm text-(--color-text-muted)">{description}</span> : null}
      </span>
    </label>
  );
}

/**
 * A row of mutually exclusive choices rendered as large pill radios -- used
 * instead of a <select> where every option should be visible at once.
 */
export function ChoiceGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  disabled,
  legend,
}: {
  name: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  legend?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      {legend ? <legend className="mb-2 text-[15px] font-semibold text-(--color-text)">{legend}</legend> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col rounded-2xl border px-4 py-3 text-[15px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--color-accent) ${
                checked
                  ? "border-(--color-accent) bg-(--color-accent) text-(--color-accent-foreground)"
                  : "border-(--color-border) bg-(--color-surface) text-(--color-text) hover:border-(--color-line)"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="font-medium">{opt.label}</span>
              {opt.description ? (
                <span className={`text-sm ${checked ? "text-(--color-accent-foreground)/75" : "text-(--color-text-muted)"}`}>
                  {opt.description}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** A titled block inside a long form, separated from the next by a thin rule. */
export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-(--color-border) py-10 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-2">
        {step ? <span className="font-(family-name:--font-display) text-sm font-semibold text-(--color-text-subtle)">{step}</span> : null}
        <h2 className="text-xl font-bold tracking-tight text-(--color-text)">{title}</h2>
        {description ? <p className="text-[15px] text-(--color-text-muted)">{description}</p> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </section>
  );
}
