"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDemoSeed } from "./seed";
import type { DemoState, DemoLinkCardExperienceSnapshot, DemoExperiment } from "./types";
import type { ChallengeStatus, ExperimentStatus } from "@/lib/domain/types";
import type {
  ChallengeValues,
  ExperienceValues,
  LinkCardValues,
  NewExperimentValues,
  NextChallengeValues,
  ReportValues,
} from "@/lib/app-data/types";

/** Per-tab storage so a reload keeps what the visitor made; closing the tab or "데모 초기화" clears it. */
const STORAGE_KEY = "next-life-demo-v1";

function loadStoredState(): DemoState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    const lists = [parsed.experiences, parsed.challenges, parsed.linkCards, parsed.experiments];
    return lists.every(Array.isArray) ? (parsed as DemoState) : null;
  } catch {
    return null;
  }
}

function saveState(state: DemoState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked or full: the demo still works, it just won't survive a reload.
  }
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Low-level, synchronous mutations of the in-memory demo state. Inputs are
 * validated with the same zod schemas as the server before they get here
 * (see components/demo/demo-data-provider.tsx), so this layer only applies
 * them -- mirroring what the corresponding server action writes.
 */
export interface DemoActions {
  reset(): void;
  createExperience(values: ExperienceValues): string;
  updateExperience(id: string, values: ExperienceValues): void;
  deleteExperience(id: string): void;
  createChallenge(values: ChallengeValues): string;
  updateChallenge(id: string, values: ChallengeValues): void;
  updateChallengeStatus(id: string, status: ChallengeStatus): void;
  deleteChallenge(id: string): void;
  createLinkCard(challengeId: string, values: LinkCardValues): string;
  updateLinkCard(id: string, values: LinkCardValues): void;
  deleteLinkCard(id: string): void;
  createExperiment(values: NewExperimentValues): string;
  updateExperimentStatus(experimentId: string, status: ExperimentStatus): void;
  extendExperimentDeadline(experimentId: string, newEndDate: string): void;
  setExperimentEmailNotify(experimentId: string, on: boolean): void;
  toggleChecklistItem(experimentId: string, itemId: string, done: boolean): void;
  addChecklistItem(experimentId: string, title: string): void;
  deleteChecklistItem(experimentId: string, itemId: string): void;
  saveReport(experimentId: string, values: ReportValues): void;
  createNextChallengeFromReport(experimentId: string, input: NextChallengeValues): string;
}

const DemoStateContext = createContext<DemoState | null>(null);
const DemoReadyContext = createContext(false);
const DemoActionsContext = createContext<DemoActions | null>(null);

function snapshots(state: DemoState, experienceIds: string[]): DemoLinkCardExperienceSnapshot[] {
  return experienceIds.map((expId) => {
    const exp = state.experiences.find((e) => e.id === expId);
    return {
      experienceId: expId,
      titleSnapshot: exp?.title ?? "삭제된 경험",
      fieldSnapshot: exp?.field ?? "",
      statusSnapshot: exp?.status ?? "COMPLETED",
      progressSnapshot: exp?.progress ?? null,
    };
  });
}

function mapExperiment(state: DemoState, id: string, fn: (exp: DemoExperiment) => DemoExperiment): DemoState {
  return { ...state, experiments: state.experiments.map((exp) => (exp.id === id ? fn(exp) : exp)) };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  // Demo state lives in this tab only (resettable, never written to any
  // account's real data). The server and the first client render use the
  // seed; after mount the tab's saved copy, if any, replaces it. Until then
  // `ready` is false so detail pages don't 404 on an item made before a reload.
  const [state, setState] = useState<DemoState>(() => createDemoSeed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadStoredState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration
    if (stored) setState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [ready, state]);

  const actions = useMemo<DemoActions>(
    () => ({
      reset: () => setState(createDemoSeed()),

      createExperience: (values) => {
        const id = randomId("exp");
        setState((prev) => ({ ...prev, experiences: [...prev.experiences, { id, ...values }] }));
        return id;
      },
      updateExperience: (id, values) =>
        setState((prev) => ({
          ...prev,
          experiences: prev.experiences.map((e) => (e.id === id ? { id, ...values } : e)),
        })),
      deleteExperience: (id) =>
        // Link cards keep their snapshot; only the live reference is cleared (onDelete: SetNull).
        setState((prev) => ({
          ...prev,
          experiences: prev.experiences.filter((e) => e.id !== id),
          linkCards: prev.linkCards.map((card) => ({
            ...card,
            experiences: card.experiences.map((s) => (s.experienceId === id ? { ...s, experienceId: null } : s)),
          })),
        })),

      createChallenge: (values) => {
        const id = randomId("challenge");
        setState((prev) => ({ ...prev, challenges: [{ id, ...values, status: "IDEA" }, ...prev.challenges] }));
        return id;
      },
      updateChallenge: (id, values) =>
        setState((prev) => ({
          ...prev,
          challenges: prev.challenges.map((c) => (c.id === id ? { ...c, ...values } : c)),
        })),
      updateChallengeStatus: (id, status) =>
        setState((prev) => ({
          ...prev,
          challenges: prev.challenges.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      deleteChallenge: (id) =>
        setState((prev) => ({
          ...prev,
          challenges: prev.challenges.filter((c) => c.id !== id),
          linkCards: prev.linkCards.filter((c) => c.challengeId !== id),
          experiments: prev.experiments.filter((e) => e.challengeId !== id),
        })),

      createLinkCard: (challengeId, values) => {
        const id = randomId("link");
        setState((prev) => {
          const challenge = prev.challenges.find((c) => c.id === challengeId);
          const { experienceIds, ...fields } = values;
          return {
            ...prev,
            linkCards: [
              {
                id,
                challengeId,
                challengeTitleSnapshot: challenge?.title ?? "",
                ...fields,
                experiences: snapshots(prev, experienceIds),
              },
              ...prev.linkCards,
            ],
          };
        });
        return id;
      },
      updateLinkCard: (id, values) =>
        setState((prev) => {
          const { experienceIds, ...fields } = values;
          return {
            ...prev,
            linkCards: prev.linkCards.map((card) =>
              card.id === id ? { ...card, ...fields, experiences: snapshots(prev, experienceIds) } : card
            ),
          };
        }),
      deleteLinkCard: (id) =>
        setState((prev) => ({
          ...prev,
          linkCards: prev.linkCards.filter((c) => c.id !== id),
          experiments: prev.experiments.map((e) => (e.linkCardId === id ? { ...e, linkCardId: undefined } : e)),
        })),

      createExperiment: (values) => {
        const id = randomId("experiment");
        setState((prev) => {
          const challenge = prev.challenges.find((c) => c.id === values.challengeId);
          const { checklist, ...fields } = values;
          const experiment: DemoExperiment = {
            id,
            ...fields,
            challengeTitleSnapshot: challenge?.title ?? "",
            status: "PREP", // same default as the Experiment model
            checklist: checklist.map((title) => ({ id: randomId("chk"), title, done: false })),
          };
          return { ...prev, experiments: [experiment, ...prev.experiments] };
        });
        return id;
      },
      updateExperimentStatus: (experimentId, status) =>
        setState((prev) => mapExperiment(prev, experimentId, (exp) => ({ ...exp, status }))),
      extendExperimentDeadline: (experimentId, newEndDate) =>
        setState((prev) =>
          mapExperiment(prev, experimentId, (exp) => ({
            ...exp,
            endDate: newEndDate,
            status: exp.status === "RETRO_PENDING" ? "IN_PROGRESS" : exp.status,
          }))
        ),
      setExperimentEmailNotify: (experimentId, on) =>
        setState((prev) => mapExperiment(prev, experimentId, (exp) => ({ ...exp, emailNotifyOn: on }))),
      toggleChecklistItem: (experimentId, itemId, done) =>
        setState((prev) =>
          mapExperiment(prev, experimentId, (exp) => ({
            ...exp,
            checklist: exp.checklist.map((item) => (item.id === itemId ? { ...item, done } : item)),
          }))
        ),
      addChecklistItem: (experimentId, title) =>
        setState((prev) =>
          mapExperiment(prev, experimentId, (exp) => ({
            ...exp,
            checklist: [...exp.checklist, { id: randomId("chk"), title, done: false }],
          }))
        ),
      deleteChecklistItem: (experimentId, itemId) =>
        setState((prev) =>
          mapExperiment(prev, experimentId, (exp) => ({
            ...exp,
            checklist: exp.checklist.filter((i) => i.id !== itemId),
          }))
        ),

      saveReport: (experimentId, values) =>
        setState((prev) =>
          mapExperiment(prev, experimentId, (exp) => {
            const { finishExperiment, ...report } = values;
            return {
              ...exp,
              status: finishExperiment ? "DONE" : exp.status,
              report: { ...report, nextChallengeId: exp.report?.nextChallengeId ?? null },
            };
          })
        ),
      createNextChallengeFromReport: (experimentId, input) => {
        const id = randomId("challenge");
        setState((prev) => ({
          ...mapExperiment(prev, experimentId, (exp) =>
            exp.report ? { ...exp, report: { ...exp.report, nextChallengeId: id } } : exp
          ),
          challenges: [{ id, ...input, status: "IDEA" }, ...prev.challenges],
        }));
        return id;
      },
    }),
    []
  );

  return (
    <DemoStateContext.Provider value={state}>
      <DemoReadyContext.Provider value={ready}>
        <DemoActionsContext.Provider value={actions}>{children}</DemoActionsContext.Provider>
      </DemoReadyContext.Provider>
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

/** False until the tab's saved demo state has been loaded after hydration. */
export function useDemoReady() {
  return useContext(DemoReadyContext);
}
