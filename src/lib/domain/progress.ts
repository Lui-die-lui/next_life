export interface ChecklistItemLike {
  done: boolean;
}

/**
 * Checklist completion percentage. Returns null when there are no items yet
 * ("진행률 미설정"), rather than 0 -- 0 items done out of 0 is not "0%".
 * A 100% here means every checklist item is checked, NOT that the report is
 * written or the experiment is finished; callers must not conflate the two.
 */
export function checklistProgress(items: ChecklistItemLike[]): number | null {
  if (items.length === 0) return null;
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

/** True once an experiment's end date has passed, regardless of its status. */
export function isPastDue(endDate: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!endDate) return false;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  return end.getTime() < now.getTime();
}
