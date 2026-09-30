import type {
  ExperienceStatus,
  ChallengeStatus,
  LinkCardStatus,
  ExperimentStatus,
  HelpfulnessRating,
} from "@/lib/domain/types";

export interface DemoExperience {
  id: string;
  field: string;
  title: string;
  whatYouDid: string;
  status: ExperienceStatus;
  progress: number | null;
  goalAtTheTime?: string;
  difficulty?: string;
  approach?: string;
  resultEvidence?: string;
}

export interface DemoChallenge {
  id: string;
  title: string;
  field: string;
  reason?: string;
  goalOrProblem: string;
  blocker?: string;
  constraints?: string;
  status: ChallengeStatus;
}

export interface DemoLinkCardExperienceSnapshot {
  experienceId: string | null;
  titleSnapshot: string;
  fieldSnapshot: string;
  statusSnapshot: ExperienceStatus;
  progressSnapshot: number | null;
}

export interface DemoLinkCard {
  id: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  experiences: DemoLinkCardExperienceSnapshot[];
  status: LinkCardStatus;
  previousProblem?: string;
  solutionPrinciple?: string;
  applyTarget?: string;
  commonGround?: string;
  differences?: string;
  verifyQuestion?: string;
  noLinkReason?: string;
}

export interface DemoChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface DemoReport {
  whatYouDid: string;
  observedResult: string;
  helpfulness: HelpfulnessRating;
  helpfulEvidence?: string;
  mismatchedConditions?: string;
  whatToChangeNext?: string;
  nextChallengeMethod?: string;
  quantResult?: string;
  nextChallengeId?: string | null;
}

export interface DemoExperiment {
  id: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  linkCardId?: string;
  title: string;
  principleToApply: string;
  action: string;
  observationTargets?: string;
  successCriteria?: string;
  startDate: string;
  endDate?: string | null;
  emailNotifyOn: boolean;
  status: ExperimentStatus;
  checklist: DemoChecklistItem[];
  report?: DemoReport;
}

export interface DemoState {
  experiences: DemoExperience[];
  challenges: DemoChallenge[];
  linkCards: DemoLinkCard[];
  experiments: DemoExperiment[];
}
