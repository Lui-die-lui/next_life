import { describe, expect, it } from "vitest";
import { checklistProgress, isPastDue } from "./progress";

describe("checklistProgress", () => {
  it("returns null for an empty checklist instead of 0%", () => {
    expect(checklistProgress([])).toBeNull();
  });

  it("computes rounded percentage of done items", () => {
    expect(
      checklistProgress([{ done: true }, { done: true }, { done: false }])
    ).toBe(67);
  });

  it("is 100 only when every item is done", () => {
    expect(checklistProgress([{ done: true }, { done: true }])).toBe(100);
  });
});

describe("isPastDue", () => {
  it("is false when there is no end date", () => {
    expect(isPastDue(null)).toBe(false);
    expect(isPastDue(undefined)).toBe(false);
  });

  it("is true once the end date has passed, independent of completion status", () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(isPastDue(past)).toBe(true);
  });

  it("is false for a future end date", () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isPastDue(future)).toBe(false);
  });
});
