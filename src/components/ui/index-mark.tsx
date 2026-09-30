/** Large index number with a small uppercase label: the text-only row marker used where lists have no image. */
export function IndexMark({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
      <span className="font-(family-name:--font-display) text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">
        {number}
      </span>
      <span className="font-(family-name:--font-display) text-sm font-semibold uppercase tracking-[0.16em] text-(--color-text-subtle)">
        {label}
      </span>
    </div>
  );
}
