// Shared domain types & label maps. Used by both the real (DB-backed) app and
// the client-only demo store, so the two stay behaviorally identical.

export type ExperienceStatus = "COMPLETED" | "IN_PROGRESS";
export type ChallengeStatus = "IDEA" | "IN_PROGRESS" | "WRAPPING_UP" | "STOPPED";
export type LinkCardStatus = "REVIEWING" | "WORTH_TRYING" | "NOT_LINKED";
export type ExperimentStatus = "PREP" | "IN_PROGRESS" | "RETRO_PENDING" | "DONE" | "STOPPED";
export type HelpfulnessRating =
  | "HELPED"
  | "PARTIALLY_HELPED"
  | "NOT_HELPED"
  | "NOT_ENOUGH_INFO";

export const EXPERIENCE_STATUS_LABEL: Record<ExperienceStatus, string> = {
  COMPLETED: "완료",
  IN_PROGRESS: "진행 중",
};

export const CHALLENGE_STATUS_LABEL: Record<ChallengeStatus, string> = {
  IDEA: "구상 중",
  IN_PROGRESS: "진행 중",
  WRAPPING_UP: "마무리",
  STOPPED: "중단",
};

export const LINK_CARD_STATUS_LABEL: Record<LinkCardStatus, string> = {
  REVIEWING: "검토 중",
  WORTH_TRYING: "시도할 만함",
  NOT_LINKED: "이번 도전에는 연결하지 않음",
};

export const EXPERIMENT_STATUS_LABEL: Record<ExperimentStatus, string> = {
  PREP: "준비",
  IN_PROGRESS: "진행 중",
  RETRO_PENDING: "회고 대기",
  DONE: "마무리",
  STOPPED: "중단",
};

export const HELPFULNESS_LABEL: Record<HelpfulnessRating, string> = {
  HELPED: "도움이 됨",
  PARTIALLY_HELPED: "일부 도움이 됨",
  NOT_HELPED: "도움이 되지 않음",
  NOT_ENOUGH_INFO: "판단할 정보 부족",
};

/** Formats an experience's status the way it should read in lists and cards. */
export function formatExperienceStatus(status: ExperienceStatus, progress: number | null | undefined) {
  if (status === "COMPLETED") return "완료";
  if (typeof progress === "number") return `진행 중 · ${progress}%`;
  return "진행 중";
}
