// View models shared by the real (DB-backed) screens and the demo. Screens
// only ever see these plain, serializable shapes; where the data comes from
// (Prisma on the server, or the in-memory demo store) and how it is saved
// is decided by the AppData adapter (see components/app/app-data.tsx).

import type {
  ChallengeStatus,
  ExperienceStatus,
  ExperimentStatus,
  HelpfulnessRating,
  LinkCardStatus,
} from "@/lib/domain/types";

export interface ExperienceView {
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

export interface ChallengeView {
  id: string;
  title: string;
  field: string;
  reason?: string;
  goalOrProblem: string;
  blocker?: string;
  constraints?: string;
  status: ChallengeStatus;
}

export interface ChecklistItemView {
  id: string;
  title: string;
  done: boolean;
}

export interface ReportView {
  whatYouDid: string;
  observedResult: string;
  helpfulness: HelpfulnessRating;
  helpfulEvidence?: string;
  mismatchedConditions?: string;
  whatToChangeNext?: string;
  nextChallengeMethod?: string;
  quantResult?: string;
  nextChallengeId: string | null;
}

/** Dates are plain `YYYY-MM-DD` strings so they cross the server/client boundary unchanged. */
export interface ExperimentSummary {
  id: string;
  title: string;
  status: ExperimentStatus;
  challengeId: string;
  challengeTitle: string;
  startDate: string;
  endDate: string | null;
  checklist: ChecklistItemView[];
  hasReport: boolean;
}

export interface ExperimentView extends ExperimentSummary {
  challengeGoal?: string;
  linkCardId: string | null;
  principleToApply: string;
  action: string;
  observationTargets?: string;
  successCriteria?: string;
  emailNotifyOn: boolean;
  report: ReportView | null;
}

export interface LinkCardExperienceView {
  experienceId: string | null;
  title: string;
  field: string;
  status: ExperienceStatus;
  progress: number | null;
}

export interface LinkCardView {
  id: string;
  challengeId: string;
  challengeTitle: string;
  status: LinkCardStatus;
  experiences: LinkCardExperienceView[];
  previousProblem?: string;
  solutionPrinciple?: string;
  applyTarget?: string;
  commonGround?: string;
  differences?: string;
  verifyQuestion?: string;
  noLinkReason?: string;
}

export interface ChallengeListItem extends ChallengeView {
  linkCardCount: number;
  experiments: ExperimentSummary[];
}

export interface ChallengeDetailView extends ChallengeView {
  linkCards: LinkCardView[];
  experiments: ExperimentSummary[];
}

// Inputs --------------------------------------------------------------------

export interface ExperienceValues {
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

export interface ChallengeValues {
  title: string;
  field: string;
  reason?: string;
  goalOrProblem: string;
  blocker?: string;
  constraints?: string;
}

export interface LinkCardValues {
  experienceIds: string[];
  status: LinkCardStatus;
  previousProblem?: string;
  solutionPrinciple?: string;
  applyTarget?: string;
  commonGround?: string;
  differences?: string;
  verifyQuestion?: string;
  noLinkReason?: string;
}

export interface NewExperimentValues {
  challengeId: string;
  linkCardId?: string;
  title: string;
  principleToApply: string;
  action: string;
  observationTargets?: string;
  successCriteria?: string;
  startDate: string;
  endDate: string | null;
  emailNotifyOn: boolean;
  checklist: string[];
}

export interface ReportValues {
  whatYouDid: string;
  observedResult: string;
  helpfulness: HelpfulnessRating;
  helpfulEvidence?: string;
  mismatchedConditions?: string;
  whatToChangeNext?: string;
  nextChallengeMethod?: string;
  quantResult?: string;
  finishExperiment: boolean;
}

export interface NextChallengeValues {
  title: string;
  field: string;
  goalOrProblem: string;
}

/** Every write a screen can make. Implemented once by server actions and once by the demo store. */
export interface AppActions {
  createExperience(values: ExperienceValues): Promise<void>;
  updateExperience(id: string, values: ExperienceValues): Promise<void>;
  deleteExperience(id: string): Promise<void>;

  createChallenge(values: ChallengeValues): Promise<{ id: string }>;
  updateChallenge(id: string, values: ChallengeValues): Promise<void>;
  updateChallengeStatus(id: string, status: ChallengeStatus): Promise<void>;
  deleteChallenge(id: string): Promise<void>;

  createLinkCard(challengeId: string, values: LinkCardValues): Promise<{ id: string }>;
  updateLinkCard(id: string, values: LinkCardValues): Promise<void>;
  deleteLinkCard(id: string): Promise<void>;

  createExperiment(values: NewExperimentValues): Promise<{ id: string }>;
  updateExperimentStatus(id: string, status: ExperimentStatus): Promise<void>;
  extendExperimentDeadline(id: string, endDate: string): Promise<void>;
  setExperimentEmailNotify(id: string, on: boolean): Promise<void>;
  toggleChecklistItem(experimentId: string, itemId: string, done: boolean): Promise<void>;
  addChecklistItem(experimentId: string, title: string): Promise<void>;
  deleteChecklistItem(experimentId: string, itemId: string): Promise<void>;

  saveReport(experimentId: string, values: ReportValues): Promise<void>;
  createNextChallengeFromReport(experimentId: string, values: NextChallengeValues): Promise<{ id: string }>;
}

export interface AppPaths {
  home: string;
  experiences: string;
  challenges: string;
  prompt: (challengeId?: string) => string;
  challenge: (id: string) => string;
  newLinkCard: (challengeId: string) => string;
  linkCard: (id: string) => string;
  newExperiment: (challengeId: string, linkCardId?: string) => string;
  experiment: (id: string) => string;
  report: (experimentId: string) => string;
  settings: string | null;
}

export function makePaths(base: "" | "/demo"): AppPaths {
  return {
    home: base === "" ? "/home" : "/demo",
    experiences: `${base}/experiences`,
    challenges: `${base}/challenges`,
    prompt: (challengeId) => `${base}/prompt${challengeId ? `?challengeId=${encodeURIComponent(challengeId)}` : ""}`,
    challenge: (id) => `${base}/challenges/${id}`,
    newLinkCard: (challengeId) => `${base}/challenges/${challengeId}/link/new`,
    linkCard: (id) => `${base}/link-cards/${id}`,
    newExperiment: (challengeId, linkCardId) =>
      `${base}/experiments/new?challengeId=${encodeURIComponent(challengeId)}${
        linkCardId ? `&linkCardId=${encodeURIComponent(linkCardId)}` : ""
      }`,
    experiment: (id) => `${base}/experiments/${id}`,
    report: (experimentId) => `${base}/experiments/${experimentId}/report`,
    settings: base === "" ? "/settings" : null,
  };
}
