import { EXPERIMENT_STATUS_LABEL, type ExperimentStatus } from "./types";
import { isPastDue } from "./progress";

export type DisplayTone = "neutral" | "accent" | "solid" | "warn";

/**
 * Status as it should read in lists: an active experiment whose end date has
 * passed without a report shows "회고할 시점" instead of its stored status.
 * Past due is a prompt to reflect, never a failure label.
 */
export function experimentStatusDisplay(e: {
  status: ExperimentStatus;
  endDate: string | null;
  hasReport: boolean;
}): { label: string; tone: DisplayTone; needsRetro: boolean } {
  const active = e.status === "PREP" || e.status === "IN_PROGRESS" || e.status === "RETRO_PENDING";
  const needsRetro = active && !e.hasReport && (e.status === "RETRO_PENDING" || isPastDue(e.endDate));
  if (needsRetro) return { label: "회고할 시점", tone: "warn", needsRetro };
  if (e.status === "IN_PROGRESS") return { label: EXPERIMENT_STATUS_LABEL[e.status], tone: "solid", needsRetro };
  if (e.status === "DONE" || e.status === "STOPPED") return { label: EXPERIMENT_STATUS_LABEL[e.status], tone: "neutral", needsRetro };
  return { label: EXPERIMENT_STATUS_LABEL[e.status], tone: "accent", needsRetro };
}

function localToday(now: Date) {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

/** "D-3", "오늘 종료", "종료 2일 지남" for a `YYYY-MM-DD` end date. */
export function deadlineLabel(endDate: string | null, now: Date = new Date()): string | null {
  if (!endDate) return null;
  const [y, m, d] = endDate.split("-").map(Number);
  const diff = Math.round((Date.UTC(y, m - 1, d) - localToday(now)) / 86_400_000);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "오늘 종료";
  return `종료 ${-diff}일 지남`;
}

/** `2026-09-30` -> `9월 30일` (or with the year when it differs from this year). */
export function formatDay(value: string | null, now: Date = new Date()): string {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return y === now.getFullYear() ? `${m}월 ${d}일` : `${y}년 ${m}월 ${d}일`;
}
