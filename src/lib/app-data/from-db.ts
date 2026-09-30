// Maps Prisma rows (already ownership-filtered by the server actions that
// loaded them) into the plain view models the shared screens render.

import type {
  ChallengeDetailView,
  ChallengeListItem,
  ChallengeView,
  ExperienceView,
  ExperimentSummary,
  ExperimentView,
  LinkCardView,
  ReportView,
} from "./types";
import type {
  ChallengeStatus,
  ExperienceStatus,
  ExperimentStatus,
  HelpfulnessRating,
  LinkCardStatus,
} from "@/lib/domain/types";

const opt = (v: string | null | undefined) => v ?? undefined;
const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

interface ExperienceRow {
  id: string;
  field: string;
  title: string;
  whatYouDid: string;
  status: ExperienceStatus;
  progress: number | null;
  goalAtTheTime: string | null;
  difficulty: string | null;
  approach: string | null;
  resultEvidence: string | null;
}

export function experienceView(e: ExperienceRow): ExperienceView {
  return {
    id: e.id,
    field: e.field,
    title: e.title,
    whatYouDid: e.whatYouDid,
    status: e.status,
    progress: e.progress,
    goalAtTheTime: opt(e.goalAtTheTime),
    difficulty: opt(e.difficulty),
    approach: opt(e.approach),
    resultEvidence: opt(e.resultEvidence),
  };
}

interface ChallengeRow {
  id: string;
  title: string;
  field: string;
  reason: string | null;
  goalOrProblem: string;
  blocker: string | null;
  constraints: string | null;
  status: ChallengeStatus;
}

export function challengeView(c: ChallengeRow): ChallengeView {
  return {
    id: c.id,
    title: c.title,
    field: c.field,
    reason: opt(c.reason),
    goalOrProblem: c.goalOrProblem,
    blocker: opt(c.blocker),
    constraints: opt(c.constraints),
    status: c.status,
  };
}

interface ChecklistRow {
  id: string;
  title: string;
  done: boolean;
  order?: number;
}

interface ExperimentRow {
  id: string;
  title: string;
  status: ExperimentStatus;
  challengeId: string;
  challengeTitleSnapshot: string;
  startDate: Date;
  endDate: Date | null;
  checklist: ChecklistRow[];
  report?: unknown;
}

function sortedChecklist(items: ChecklistRow[]) {
  return [...items]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((i) => ({ id: i.id, title: i.title, done: i.done }));
}

export function experimentSummary(e: ExperimentRow): ExperimentSummary {
  return {
    id: e.id,
    title: e.title,
    status: e.status,
    challengeId: e.challengeId,
    challengeTitle: e.challengeTitleSnapshot,
    startDate: day(e.startDate) ?? "",
    endDate: day(e.endDate),
    checklist: sortedChecklist(e.checklist),
    hasReport: Boolean(e.report),
  };
}

interface ReportRow {
  whatYouDid: string;
  observedResult: string;
  helpfulness: HelpfulnessRating;
  helpfulEvidence: string | null;
  mismatchedConditions: string | null;
  whatToChangeNext: string | null;
  nextChallengeMethod: string | null;
  quantResult: string | null;
  nextChallengeId: string | null;
}

function reportView(r: ReportRow): ReportView {
  return {
    whatYouDid: r.whatYouDid,
    observedResult: r.observedResult,
    helpfulness: r.helpfulness,
    helpfulEvidence: opt(r.helpfulEvidence),
    mismatchedConditions: opt(r.mismatchedConditions),
    whatToChangeNext: opt(r.whatToChangeNext),
    nextChallengeMethod: opt(r.nextChallengeMethod),
    quantResult: opt(r.quantResult),
    nextChallengeId: r.nextChallengeId,
  };
}

interface ExperimentDetailRow extends ExperimentRow {
  linkCardId: string | null;
  principleToApply: string;
  action: string;
  observationTargets: string | null;
  successCriteria: string | null;
  emailNotifyOn: boolean;
  report: ReportRow | null;
  challenge?: { goalOrProblem: string } | null;
}

export function experimentView(e: ExperimentDetailRow): ExperimentView {
  return {
    ...experimentSummary(e),
    challengeGoal: e.challenge?.goalOrProblem,
    linkCardId: e.linkCardId,
    principleToApply: e.principleToApply,
    action: e.action,
    observationTargets: opt(e.observationTargets),
    successCriteria: opt(e.successCriteria),
    emailNotifyOn: e.emailNotifyOn,
    report: e.report ? reportView(e.report) : null,
  };
}

interface LinkCardRow {
  id: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  status: LinkCardStatus;
  previousProblem: string | null;
  solutionPrinciple: string | null;
  applyTarget: string | null;
  commonGround: string | null;
  differences: string | null;
  verifyQuestion: string | null;
  noLinkReason: string | null;
  experiences: {
    experienceId: string | null;
    experienceTitleSnapshot: string;
    experienceFieldSnapshot: string;
    experienceStatusSnapshot: ExperienceStatus;
    experienceProgressSnapshot: number | null;
  }[];
}

export function linkCardView(c: LinkCardRow): LinkCardView {
  return {
    id: c.id,
    challengeId: c.challengeId,
    challengeTitle: c.challengeTitleSnapshot,
    status: c.status,
    experiences: c.experiences.map((e) => ({
      experienceId: e.experienceId,
      title: e.experienceTitleSnapshot,
      field: e.experienceFieldSnapshot,
      status: e.experienceStatusSnapshot,
      progress: e.experienceProgressSnapshot,
    })),
    previousProblem: opt(c.previousProblem),
    solutionPrinciple: opt(c.solutionPrinciple),
    applyTarget: opt(c.applyTarget),
    commonGround: opt(c.commonGround),
    differences: opt(c.differences),
    verifyQuestion: opt(c.verifyQuestion),
    noLinkReason: opt(c.noLinkReason),
  };
}

export function challengeListItem(
  c: ChallengeRow & { experiments: ExperimentRow[]; _count: { linkCards: number } }
): ChallengeListItem {
  return {
    ...challengeView(c),
    linkCardCount: c._count.linkCards,
    experiments: c.experiments.map(experimentSummary),
  };
}

export function challengeDetailView(
  c: ChallengeRow & { linkCards: LinkCardRow[]; experiments: ExperimentRow[] }
): ChallengeDetailView {
  return {
    ...challengeView(c),
    linkCards: c.linkCards.map(linkCardView),
    experiments: c.experiments.map(experimentSummary),
  };
}
