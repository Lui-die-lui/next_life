import { z } from "zod";

// Small reusable pieces -------------------------------------------------

/** A required text field: rejects empty or whitespace-only input. */
const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "필수 입력 항목입니다.")
    .max(max, `${max}자 이내로 입력해 주세요.`);

/** An optional text field: blank becomes undefined so it's omitted, not stored as "". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자 이내로 입력해 주세요.`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

const TITLE_MAX = 120;
const SHORT_MAX = 300;
const LONG_MAX = 4000;

// Experience --------------------------------------------------------------

export const experienceStatusEnum = z.enum(["COMPLETED", "IN_PROGRESS"]);

export const experienceInputSchema = z
  .object({
    field: requiredText(SHORT_MAX),
    title: requiredText(TITLE_MAX),
    whatYouDid: requiredText(LONG_MAX),
    status: experienceStatusEnum,
    progress: z.coerce.number().int().min(0).max(99).optional().nullable(),
    goalAtTheTime: optionalText(LONG_MAX),
    difficulty: optionalText(LONG_MAX),
    approach: optionalText(LONG_MAX),
    resultEvidence: optionalText(LONG_MAX),
  })
  .transform((v) => ({
    ...v,
    // Progress only means something while the experience is in progress.
    progress: v.status === "IN_PROGRESS" ? (v.progress ?? null) : null,
  }));

export type ExperienceInput = z.input<typeof experienceInputSchema>;

// Challenge -----------------------------------------------------------------

export const challengeStatusEnum = z.enum(["IDEA", "IN_PROGRESS", "WRAPPING_UP", "STOPPED"]);

export const challengeInputSchema = z.object({
  title: requiredText(TITLE_MAX),
  field: requiredText(SHORT_MAX),
  reason: optionalText(LONG_MAX),
  goalOrProblem: requiredText(LONG_MAX),
  blocker: optionalText(LONG_MAX),
  constraints: optionalText(LONG_MAX),
});

export type ChallengeInput = z.input<typeof challengeInputSchema>;

const CHALLENGE_TRANSITIONS: Record<string, string[]> = {
  IDEA: ["IDEA", "IN_PROGRESS", "STOPPED"],
  IN_PROGRESS: ["IN_PROGRESS", "WRAPPING_UP", "STOPPED"],
  WRAPPING_UP: ["WRAPPING_UP", "IN_PROGRESS", "STOPPED"],
  STOPPED: ["STOPPED", "IDEA", "IN_PROGRESS"],
};

export function isValidChallengeTransition(from: string, to: string) {
  return CHALLENGE_TRANSITIONS[from]?.includes(to) ?? false;
}

// Link card ------------------------------------------------------------------

export const linkCardStatusEnum = z.enum(["REVIEWING", "WORTH_TRYING", "NOT_LINKED"]);

export const linkCardInputSchema = z
  .object({
    challengeId: z.string().min(1),
    experienceIds: z.array(z.string().min(1)).default([]),
    status: linkCardStatusEnum.default("REVIEWING"),
    previousProblem: optionalText(LONG_MAX),
    solutionPrinciple: optionalText(LONG_MAX),
    applyTarget: optionalText(LONG_MAX),
    commonGround: optionalText(LONG_MAX),
    differences: optionalText(LONG_MAX),
    verifyQuestion: optionalText(LONG_MAX),
    noLinkReason: optionalText(LONG_MAX),
  })
  .refine(
    (v) => v.status !== "NOT_LINKED" || (v.noLinkReason?.length ?? 0) > 0,
    { message: "연결하지 않는 이유를 남겨 주세요.", path: ["noLinkReason"] }
  );

export type LinkCardInput = z.input<typeof linkCardInputSchema>;
export type LinkCardUpdateInput = Omit<LinkCardInput, "challengeId">;

// Experiment ------------------------------------------------------------------

export const experimentStatusEnum = z.enum([
  "PREP",
  "IN_PROGRESS",
  "RETRO_PENDING",
  "DONE",
  "STOPPED",
]);

export const experimentInputSchema = z
  .object({
    challengeId: z.string().min(1),
    linkCardId: z.string().min(1).optional(),
    title: requiredText(TITLE_MAX),
    principleToApply: requiredText(LONG_MAX),
    action: requiredText(LONG_MAX),
    observationTargets: optionalText(LONG_MAX),
    successCriteria: optionalText(LONG_MAX),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    emailNotifyOn: z.boolean().default(true),
    checklist: z
      .array(requiredText(TITLE_MAX))
      .max(50, "체크리스트 항목은 50개 이내로 만들어 주세요.")
      .default([]),
  })
  .refine((v) => !v.endDate || v.endDate.getTime() >= v.startDate.getTime(), {
    message: "예정 종료일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  });

export type ExperimentInput = z.input<typeof experimentInputSchema>;

const EXPERIMENT_TRANSITIONS: Record<string, string[]> = {
  PREP: ["PREP", "IN_PROGRESS", "STOPPED"],
  IN_PROGRESS: ["IN_PROGRESS", "RETRO_PENDING", "DONE", "STOPPED"],
  RETRO_PENDING: ["RETRO_PENDING", "DONE", "IN_PROGRESS", "STOPPED"],
  DONE: ["DONE"],
  STOPPED: ["STOPPED"],
};

export function isValidExperimentTransition(from: string, to: string) {
  return EXPERIMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

// Experiment report -------------------------------------------------------

export const helpfulnessEnum = z.enum([
  "HELPED",
  "PARTIALLY_HELPED",
  "NOT_HELPED",
  "NOT_ENOUGH_INFO",
]);

export const experimentReportInputSchema = z.object({
  whatYouDid: requiredText(LONG_MAX),
  observedResult: requiredText(LONG_MAX),
  helpfulness: helpfulnessEnum,
  helpfulEvidence: optionalText(LONG_MAX),
  mismatchedConditions: optionalText(LONG_MAX),
  whatToChangeNext: optionalText(LONG_MAX),
  nextChallengeMethod: optionalText(LONG_MAX),
  quantResult: optionalText(SHORT_MAX),
  finishExperiment: z.boolean().default(false),
});

export type ExperimentReportInput = z.input<typeof experimentReportInputSchema>;

// Notification settings -----------------------------------------------------

export const notificationSettingInputSchema = z.object({
  emailEnabled: z.boolean(),
});

export const experimentNotificationInputSchema = z.object({
  emailNotifyOn: z.boolean(),
});
