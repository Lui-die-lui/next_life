"use client";

import Link from "next/link";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { checklistProgress } from "@/lib/domain/progress";
import { deadlineLabel, experimentStatusDisplay, formatDay } from "@/lib/domain/experiment-display";
import type { ExperimentSummary } from "@/lib/app-data/types";

export function ExperimentStatusBadge({ experiment }: { experiment: Pick<ExperimentSummary, "status" | "endDate" | "hasReport"> }) {
  const s = experimentStatusDisplay(experiment);
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** One experiment as a compact, fully clickable list row: title, status, checklist and deadline. */
export function ExperimentLine({
  experiment,
  href,
  showChallenge = false,
  size = "md",
}: {
  experiment: ExperimentSummary;
  href: string;
  showChallenge?: boolean;
  size?: "sm" | "md";
}) {
  const progress = checklistProgress(experiment.checklist);
  const done = experiment.checklist.filter((i) => i.done).length;
  const deadline = deadlineLabel(experiment.endDate);
  return (
    <Link
      href={href}
      className={`group grid gap-3 border-b border-(--color-border) ${size === "sm" ? "py-4" : "py-5"} sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto] sm:items-center sm:gap-8`}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className={`${size === "sm" ? "text-base" : "text-lg"} font-semibold group-hover:underline group-hover:underline-offset-4`}>
            {experiment.title}
          </span>
          <ExperimentStatusBadge experiment={experiment} />
        </span>
        {showChallenge && <span className="truncate text-[15px] text-(--color-text-muted)">도전 · {experiment.challengeTitle}</span>}
      </span>
      <span className="flex flex-col gap-1">
        <ProgressBar value={progress} size="sm" />
        {progress !== null && (
          <span className="text-sm text-(--color-text-subtle)">
            체크리스트 {done}/{experiment.checklist.length}
          </span>
        )}
      </span>
      <span className="flex items-center justify-between gap-4 text-[15px] sm:justify-end" suppressHydrationWarning>
        {experiment.endDate ? (
          <span className="text-(--color-text-muted)">
            {formatDay(experiment.endDate)} <span className="font-semibold text-(--color-text)">{deadline}</span>
          </span>
        ) : (
          <span className="text-(--color-text-subtle)">종료일 미정</span>
        )}
        <span aria-hidden className="text-(--color-text-subtle) transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
