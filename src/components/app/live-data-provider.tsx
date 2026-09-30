"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppDataProvider, type AppData } from "./app-data";
import { makePaths, type AppActions } from "@/lib/app-data/types";
import { createExperience, updateExperience, deleteExperience } from "@/server/actions/experiences";
import {
  createChallenge,
  updateChallenge,
  updateChallengeStatus,
  deleteChallenge,
} from "@/server/actions/challenges";
import { createLinkCard, updateLinkCard, deleteLinkCard } from "@/server/actions/link-cards";
import {
  createExperiment,
  updateExperimentStatus,
  extendExperimentDeadline,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from "@/server/actions/experiments";
import { saveExperimentReport, createNextChallengeFromReport } from "@/server/actions/reports";
import { setExperimentEmailNotify } from "@/server/actions/settings";

/**
 * Zod validation errors thrown inside a server action arrive as an Error
 * whose message is the JSON issue list; surface the first issue's text.
 */
function readable(err: unknown): Error {
  if (err instanceof Error && err.message.trim().startsWith("[")) {
    try {
      const issues = JSON.parse(err.message) as { message?: string }[];
      if (issues[0]?.message) return new Error(issues[0].message);
    } catch {
      // not JSON -- fall through
    }
  }
  return err instanceof Error ? err : new Error("요청을 처리하지 못했습니다.");
}

/**
 * Real-account adapter: every write goes through the existing server
 * actions (which re-check the session and ownership themselves), then the
 * current route is refreshed so any screen showing that record -- not only
 * the path the action revalidates -- re-renders with fresh server data.
 */
export function LiveDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const value = useMemo<AppData>(() => {
    async function run<T>(fn: () => Promise<T>): Promise<T> {
      try {
        const result = await fn();
        router.refresh();
        return result;
      } catch (err) {
        throw readable(err);
      }
    }

    const actions: AppActions = {
      createExperience: (v) => run(async () => void (await createExperience(v))),
      updateExperience: (id, v) => run(() => updateExperience(id, v)),
      deleteExperience: (id) => run(() => deleteExperience(id)),

      createChallenge: (v) => run(async () => ({ id: (await createChallenge(v)).id })),
      updateChallenge: (id, v) => run(() => updateChallenge(id, v)),
      updateChallengeStatus: (id, s) => run(() => updateChallengeStatus(id, s)),
      deleteChallenge: (id) => run(() => deleteChallenge(id)),

      createLinkCard: (challengeId, v) => run(async () => ({ id: (await createLinkCard({ challengeId, ...v })).id })),
      updateLinkCard: (id, v) => run(() => updateLinkCard(id, v)),
      deleteLinkCard: (id) => run(() => deleteLinkCard(id)),

      createExperiment: (v) =>
        run(async () => {
          const experiment = await createExperiment({
            ...v,
            startDate: new Date(v.startDate),
            endDate: v.endDate ? new Date(v.endDate) : null,
          });
          return { id: experiment.id };
        }),
      updateExperimentStatus: (id, s) => run(() => updateExperimentStatus(id, s)),
      extendExperimentDeadline: (id, endDate) => run(() => extendExperimentDeadline(id, new Date(endDate))),
      setExperimentEmailNotify: (id, on) => run(async () => void (await setExperimentEmailNotify(id, on))),
      toggleChecklistItem: (_experimentId, itemId, done) => run(() => toggleChecklistItem(itemId, done)),
      addChecklistItem: (experimentId, title) => run(() => addChecklistItem(experimentId, title)),
      deleteChecklistItem: (_experimentId, itemId) => run(() => deleteChecklistItem(itemId)),

      saveReport: (experimentId, v) => run(async () => void (await saveExperimentReport(experimentId, v))),
      createNextChallengeFromReport: (experimentId, v) =>
        run(async () => ({ id: (await createNextChallengeFromReport(experimentId, v)).id })),
    };

    return { mode: "live", paths: makePaths(""), actions };
  }, [router]);

  return <AppDataProvider value={value}>{children}</AppDataProvider>;
}
