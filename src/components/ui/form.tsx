"use client";

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:border-(--color-accent) focus:outline-none focus:ring-2 focus:ring-(--color-accent-soft) disabled:opacity-60";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-(--color-text)">
        {label}
        {required && <span className="ml-1 text-(--color-danger)">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-(--color-text-muted)">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-(--color-danger)">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${fieldBase} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-(--color-text)">
      <input
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded border-(--color-border) text-(--color-accent) focus:ring-(--color-accent-soft)"
      />
      {label}
    </label>
  );
}
