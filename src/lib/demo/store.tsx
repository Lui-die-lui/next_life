"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { createDemoSeed } from "./seed";
import type { DemoState, DemoLinkCard, DemoReport, DemoExperiment } from "./types";
import type { LinkCardStatus } from "@/lib/domain/types";

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

interface LinkCardValues {
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

interface ReportValues extends Omit<DemoReport, "nextChallengeId"> {
  finishExperiment: boolean;
}

interface DemoActions {
  reset: () => void;
  updateLinkCard: (id: string, values: LinkCardValues) => void;
  createLinkCard: (challengeId: string, values: LinkCardValues) => string;
  toggleChecklistItem: (experimentId: string, itemId: string, done: boolean) => void;
  addChecklistItem: (experimentId: string, title: string) => void;
  deleteChecklistItem: (experimentId: string, itemId: string) => void;
  updateExperimentStatus: (experimentId: string, status: DemoExperiment["status"]) => void;
  extendExperimentDeadline: (experimentId: string, newEndDate: string) => void;
  setExperimentEmailNotify: (experimentId: string, on: boolean) => void;
  saveReport: (experimentId: string, values: ReportValues) => void;
  createNextChallengeFromReport: (
    experimentId: string,
    input: { title: string; field: string; goalOrProblem: string }
  ) => string;
}

const DemoStateContext = createContext<DemoState | null>(null);
const DemoActionsContext = createContext<DemoActions | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  // Demo state lives only in memory for the current visit (resettable, never
  // written to any account's real data). It intentionally does not persist
  // across a hard reload -- only across client-side navigation within /demo,
  // since this provider stays mounted at the /demo layout.
  const [state, setState] = useState<DemoState>(() => createDemoSeed());

  const reset = useCallback(() => {
    setState(createDemoSeed());
  }, []);

  const updateLinkCard = useCallback((id: string, values: LinkCardValues) => {
    setState((prev) => ({
      ...prev,
      linkCards: prev.linkCards.map((card) =>
        card.id === id
          ? {
              ...card,
              status: values.status,
              previousProblem: values.previousProblem,
              solutionPrinciple: values.solutionPrinciple,
              applyTarget: values.applyTarget,
              commonGround: values.commonGround,
              differences: values.differences,
              verifyQuestion: values.verifyQuestion,
              noLinkReason: values.noLinkReason,
              experiences: values.experienceIds.map((expId) => {
                const exp = prev.experiences.find((e) => e.id === expId);
                return {
                  experienceId: expId,
                  titleSnapshot: exp?.title ?? "삭제된 경험",
                  fieldSnapshot: exp?.field ?? "",
                  statusSnapshot: exp?.status ?? "COMPLETED",
                  progressSnapshot: exp?.progress ?? null,
                };
              }),
            }
          : card
      ),
    }));
  }, []);

  const createLinkCard = useCallback((challengeId: string, values: LinkCardValues) => {
    const id = randomId("link");
    setState((prev) => {
      const challenge = prev.challenges.find((c) => c.id === challengeId);
      const newCard: DemoLinkCard = {
        id,
        challengeId,
        challengeTitleSnapshot: challenge?.title ?? "",
        status: values.status,
        previousProblem: values.previousProblem,
        solutionPrinciple: values.solutionPrinciple,
        applyTarget: values.applyTarget,
        commonGround: values.commonGround,
        differences: values.differences,
        verifyQuestion: values.verifyQuestion,
        noLinkReason: values.noLinkReason,
        experiences: values.experienceIds.map((expId) => {
          const exp = prev.experiences.find((e) => e.id === expId);
          return {
            experienceId: expId,
            titleSnapshot: exp?.title ?? "삭제된 경험",
            fieldSnapshot: exp?.field ?? "",
            statusSnapshot: exp?.status ?? "COMPLETED",
            progressSnapshot: exp?.progress ?? null,
          };
        }),
      };
      return { ...prev, linkCards: [newCard, ...prev.linkCards] };
    });
    return id;
  }, []);

  const toggleChecklistItem = useCallback((experimentId: string, itemId: string, done: boolean) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) =>
        exp.id === experimentId
          ? { ...exp, checklist: exp.checklist.map((item) => (item.id === itemId ? { ...item, done } : item)) }
          : exp
      ),
    }));
  }, []);

  const addChecklistItem = useCallback((experimentId: string, title: string) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) =>
        exp.id === experimentId
          ? { ...exp, checklist: [...exp.checklist, { id: randomId("chk"), title, done: false }] }
          : exp
      ),
    }));
  }, []);

  const deleteChecklistItem = useCallback((experimentId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) =>
        exp.id === experimentId ? { ...exp, checklist: exp.checklist.filter((i) => i.id !== itemId) } : exp
      ),
    }));
  }, []);

  const updateExperimentStatus = useCallback((experimentId: string, status: DemoExperiment["status"]) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) => (exp.id === experimentId ? { ...exp, status } : exp)),
    }));
  }, []);

  const extendExperimentDeadline = useCallback((experimentId: string, newEndDate: string) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) =>
        exp.id === experimentId
          ? { ...exp, endDate: newEndDate, status: exp.status === "RETRO_PENDING" ? "IN_PROGRESS" : exp.status }
          : exp
      ),
    }));
  }, []);

  const setExperimentEmailNotify = useCallback((experimentId: string, on: boolean) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) => (exp.id === experimentId ? { ...exp, emailNotifyOn: on } : exp)),
    }));
  }, []);

  const saveReport = useCallback((experimentId: string, values: ReportValues) => {
    setState((prev) => ({
      ...prev,
      experiments: prev.experiments.map((exp) =>
        exp.id === experimentId
          ? {
              ...exp,
              status: values.finishExperiment ? "DONE" : exp.status,
              report: {
                whatYouDid: values.whatYouDid,
                observedResult: values.observedResult,
                helpfulness: values.helpfulness,
                helpfulEvidence: values.helpfulEvidence,
                mismatchedConditions: values.mismatchedConditions,
                whatToChangeNext: values.whatToChangeNext,
                nextChallengeMethod: values.nextChallengeMethod,
                quantResult: values.quantResult,
                nextChallengeId: exp.report?.nextChallengeId ?? null,
              },
            }
          : exp
      ),
    }));
  }, []);

  const createNextChallengeFromReport = useCallback(
    (experimentId: string, input: { title: string; field: string; goalOrProblem: string }) => {
      const id = randomId("challenge");
      setState((prev) => ({
        ...prev,
        challenges: [
          { id, title: input.title, field: input.field, goalOrProblem: input.goalOrProblem, status: "IDEA" },
          ...prev.challenges,
        ],
        experiments: prev.experiments.map((exp) =>
          exp.id === experimentId && exp.report ? { ...exp, report: { ...exp.report, nextChallengeId: id } } : exp
        ),
      }));
      return id;
    },
    []
  );

  const actions: DemoActions = {
    reset,
    updateLinkCard,
    createLinkCard,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    updateExperimentStatus,
    extendExperimentDeadline,
    setExperimentEmailNotify,
    saveReport,
    createNextChallengeFromReport,
  };

  return (
    <DemoStateContext.Provider value={state}>
      <DemoActionsContext.Provider value={actions}>{children}</DemoActionsContext.Provider>
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error("useDemoState must be used within DemoProvider");
  return ctx;
}

export function useDemoActions() {
  const ctx = useContext(DemoActionsContext);
  if (!ctx) throw new Error("useDemoActions must be used within DemoProvider");
  return ctx;
}
