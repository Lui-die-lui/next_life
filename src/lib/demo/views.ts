// Selectors: demo state -> the same view models the real screens receive
// from the server, so demo pages can render the shared screen components.

import type { DemoExperiment, DemoLinkCard, DemoState } from "./types";
import type {
  ChallengeDetailView,
  ChallengeListItem,
  ExperienceView,
  ExperimentSummary,
  ExperimentView,
  LinkCardView,
} from "@/lib/app-data/types";

export function demoExperiences(state: DemoState): ExperienceView[] {
  return [...state.experiences];
}

export function demoExperimentSummary(e: DemoExperiment): ExperimentSummary {
  return {
    id: e.id,
    title: e.title,
    status: e.status,
    challengeId: e.challengeId,
    challengeTitle: e.challengeTitleSnapshot,
    startDate: e.startDate,
    endDate: e.endDate ?? null,
    checklist: e.checklist,
    hasReport: Boolean(e.report),
  };
}

export function demoLinkCardView(c: DemoLinkCard): LinkCardView {
  const { challengeTitleSnapshot, experiences, ...rest } = c;
  return {
    ...rest,
    challengeTitle: challengeTitleSnapshot,
    experiences: experiences.map((s) => ({
      experienceId: s.experienceId,
      title: s.titleSnapshot,
      field: s.fieldSnapshot,
      status: s.statusSnapshot,
      progress: s.progressSnapshot,
    })),
  };
}

export function demoChallengeList(state: DemoState): ChallengeListItem[] {
  return state.challenges.map((c) => ({
    ...c,
    linkCardCount: state.linkCards.filter((l) => l.challengeId === c.id).length,
    experiments: state.experiments.filter((e) => e.challengeId === c.id).map(demoExperimentSummary),
  }));
}

export function demoChallengeDetail(state: DemoState, id: string): ChallengeDetailView | null {
  const c = state.challenges.find((x) => x.id === id);
  if (!c) return null;
  return {
    ...c,
    linkCards: state.linkCards.filter((l) => l.challengeId === id).map(demoLinkCardView),
    experiments: state.experiments.filter((e) => e.challengeId === id).map(demoExperimentSummary),
  };
}

export function demoActiveExperiments(state: DemoState): ExperimentSummary[] {
  // Same filter and order as listHomeExperiments(): active statuses, soonest end date first.
  return state.experiments
    .filter((e) => e.status === "PREP" || e.status === "IN_PROGRESS" || e.status === "RETRO_PENDING")
    .sort((a, b) => (a.endDate ?? "9999").localeCompare(b.endDate ?? "9999"))
    .map(demoExperimentSummary);
}

export function demoExperimentView(state: DemoState, id: string): ExperimentView | null {
  const e = state.experiments.find((x) => x.id === id);
  if (!e) return null;
  const challenge = state.challenges.find((c) => c.id === e.challengeId);
  return {
    ...demoExperimentSummary(e),
    challengeGoal: challenge?.goalOrProblem,
    linkCardId: e.linkCardId ?? null,
    principleToApply: e.principleToApply,
    action: e.action,
    observationTargets: e.observationTargets,
    successCriteria: e.successCriteria,
    emailNotifyOn: e.emailNotifyOn,
    report: e.report ? { ...e.report, nextChallengeId: e.report.nextChallengeId ?? null } : null,
  };
}
