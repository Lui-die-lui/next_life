import { describe, expect, it } from "vitest";
import {
  experienceInputSchema,
  challengeInputSchema,
  linkCardInputSchema,
  experimentInputSchema,
  isValidChallengeTransition,
  isValidExperimentTransition,
} from "./validation";

describe("experienceInputSchema", () => {
  const base = {
    field: "음악",
    title: "플룻 전공",
    whatYouDid: "대학에서 전공했다",
    status: "COMPLETED" as const,
  };

  it("rejects whitespace-only required text", () => {
    expect(() => experienceInputSchema.parse({ ...base, title: "   " })).toThrow();
  });

  it("accepts progress within 0..99 while in progress", () => {
    const parsed = experienceInputSchema.parse({ ...base, status: "IN_PROGRESS", progress: 60 });
    expect(parsed.progress).toBe(60);
  });

  it("rejects progress above 99", () => {
    expect(() =>
      experienceInputSchema.parse({ ...base, status: "IN_PROGRESS", progress: 100 })
    ).toThrow();
  });

  it("clears progress when status is completed, even if a value was sent", () => {
    const parsed = experienceInputSchema.parse({ ...base, status: "COMPLETED", progress: 60 });
    expect(parsed.progress).toBeNull();
  });

  it("drops blank optional fields instead of storing empty strings", () => {
    const parsed = experienceInputSchema.parse({ ...base, difficulty: "" });
    expect(parsed.difficulty).toBeUndefined();
  });
});

describe("challengeInputSchema", () => {
  it("requires a non-empty goal or problem", () => {
    expect(() =>
      challengeInputSchema.parse({ title: "도전", field: "분야", goalOrProblem: "" })
    ).toThrow();
  });
});

describe("linkCardInputSchema", () => {
  const base = { challengeId: "c1", experienceIds: ["e1"] };

  it("requires a reason when the status is NOT_LINKED", () => {
    expect(() => linkCardInputSchema.parse({ ...base, status: "NOT_LINKED" })).toThrow();
  });

  it("accepts NOT_LINKED once a reason is given", () => {
    const parsed = linkCardInputSchema.parse({ ...base, status: "NOT_LINKED", noLinkReason: "구조가 다름" });
    expect(parsed.noLinkReason).toBe("구조가 다름");
  });

  it("requires at least one experience", () => {
    expect(() => linkCardInputSchema.parse({ ...base, experienceIds: [], status: "REVIEWING" })).toThrow();
  });

  it("lets a REVIEWING card stay a draft with no answers", () => {
    expect(() => linkCardInputSchema.parse({ ...base, status: "REVIEWING" })).not.toThrow();
  });

  it("requires principle, common ground and differences for WORTH_TRYING", () => {
    const answered = { solutionPrinciple: "리허설 반복", commonGround: "보여주는 순간이 정해짐", differences: "촬영은 편집 가능" };
    expect(() => linkCardInputSchema.parse({ ...base, status: "WORTH_TRYING" })).toThrow();
    expect(() => linkCardInputSchema.parse({ ...base, status: "WORTH_TRYING", ...answered, differences: "   " })).toThrow();
    expect(() => linkCardInputSchema.parse({ ...base, status: "WORTH_TRYING", ...answered })).not.toThrow();
  });

  it("does not require a reason for WORTH_TRYING", () => {
    const parsed = linkCardInputSchema.parse({
      ...base,
      status: "WORTH_TRYING",
      solutionPrinciple: "원리",
      commonGround: "공통점",
      differences: "차이",
    });
    expect(parsed.noLinkReason).toBeUndefined();
  });
});

describe("experimentInputSchema", () => {
  const base = {
    challengeId: "c1",
    title: "실험",
    principleToApply: "원리",
    action: "행동",
    startDate: new Date("2026-01-01"),
  };

  it("rejects an end date before the start date", () => {
    expect(() =>
      experimentInputSchema.parse({ ...base, endDate: new Date("2025-12-31") })
    ).toThrow();
  });

  it("accepts an end date on or after the start date", () => {
    expect(() =>
      experimentInputSchema.parse({ ...base, endDate: new Date("2026-01-02") })
    ).not.toThrow();
  });

  it("defaults to an empty checklist when none is given", () => {
    const parsed = experimentInputSchema.parse(base);
    expect(parsed.checklist).toEqual([]);
  });
});

describe("status transition guards", () => {
  it("allows a challenge to move from IN_PROGRESS to WRAPPING_UP", () => {
    expect(isValidChallengeTransition("IN_PROGRESS", "WRAPPING_UP")).toBe(true);
  });

  it("rejects an invalid challenge transition", () => {
    expect(isValidChallengeTransition("STOPPED", "WRAPPING_UP")).toBe(false);
  });

  it("does not require completing one challenge before starting another (no forced lock)", () => {
    // IDEA and IN_PROGRESS challenges are independent rows; nothing in the
    // transition table conditions one challenge's status on another's.
    expect(isValidChallengeTransition("IDEA", "IN_PROGRESS")).toBe(true);
  });

  it("allows an experiment to move from IN_PROGRESS to RETRO_PENDING or DONE", () => {
    expect(isValidExperimentTransition("IN_PROGRESS", "RETRO_PENDING")).toBe(true);
    expect(isValidExperimentTransition("IN_PROGRESS", "DONE")).toBe(true);
  });

  it("treats DONE and STOPPED as terminal", () => {
    expect(isValidExperimentTransition("DONE", "IN_PROGRESS")).toBe(false);
    expect(isValidExperimentTransition("STOPPED", "IN_PROGRESS")).toBe(false);
  });
});
