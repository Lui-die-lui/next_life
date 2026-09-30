"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ZodType } from "zod";
import { AppDataProvider, type AppData } from "@/components/app/app-data";
import { makePaths, type AppActions } from "@/lib/app-data/types";
import { useDemoActions, useDemoState } from "@/lib/demo/store";
import {
  challengeInputSchema,
  experienceInputSchema,
  experimentInputSchema,
  experimentReportInputSchema,
  isValidChallengeTransition,
  isValidExperimentTransition,
  linkCardInputSchema,
} from "@/lib/domain/validation";

/** Same validation as the server actions, with the first issue as a readable error. */
function check<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
  return result.data;
}

/**
 * Demo adapter: identical interface to the live one, but writes land in the
 * in-memory demo store for this tab only. Nothing here can reach the
 * database or a real account, and no email is ever sent.
 */
export function DemoDataProvider({ children }: { children: ReactNode }) {
  const demo = useDemoActions();
  const state = useDemoState();
  // Status-transition checks need the latest state without rebuilding the adapter on every change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const value = useMemo<AppData>(() => {
    const clean = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T; // drop undefined keys

    const actions: AppActions = {
      async createExperience(v) {
        demo.createExperience(clean(check(experienceInputSchema, v)));
      },
      async updateExperience(id, v) {
        demo.updateExperience(id, clean(check(experienceInputSchema, v)));
      },
      async deleteExperience(id) {
        demo.deleteExperience(id);
      },

      async createChallenge(v) {
        return { id: demo.createChallenge(clean(check(challengeInputSchema, v))) };
      },
      async updateChallenge(id, v) {
        demo.updateChallenge(id, clean(check(challengeInputSchema, v)));
      },
      async updateChallengeStatus(id, status) {
        const current = stateRef.current.challenges.find((c) => c.id === id);
        if (!current || !isValidChallengeTransition(current.status, status)) {
          throw new Error("허용되지 않는 상태 변경입니다.");
        }
        demo.updateChallengeStatus(id, status);
      },
      async deleteChallenge(id) {
        demo.deleteChallenge(id);
      },

      async createLinkCard(challengeId, v) {
        const { experienceIds, status, ...answers } = check(linkCardInputSchema, { challengeId, ...v });
        delete (answers as { challengeId?: string }).challengeId;
        return { id: demo.createLinkCard(challengeId, clean({ experienceIds, status, ...answers })) };
      },
      async updateLinkCard(id, v) {
        const card = stateRef.current.linkCards.find((c) => c.id === id);
        const { experienceIds, status, ...answers } = check(linkCardInputSchema, { challengeId: card?.challengeId ?? "-", ...v });
        delete (answers as { challengeId?: string }).challengeId;
        demo.updateLinkCard(id, clean({ experienceIds, status, ...answers }));
      },
      async deleteLinkCard(id) {
        demo.deleteLinkCard(id);
      },

      async createExperiment(v) {
        check(experimentInputSchema, v);
        return {
          id: demo.createExperiment({
            ...v,
            title: v.title.trim(),
            checklist: v.checklist.map((c) => c.trim()).filter(Boolean),
          }),
        };
      },
      async updateExperimentStatus(id, status) {
        const current = stateRef.current.experiments.find((e) => e.id === id);
        if (!current || !isValidExperimentTransition(current.status, status)) {
          throw new Error("허용되지 않는 상태 변경입니다.");
        }
        demo.updateExperimentStatus(id, status);
      },
      async extendExperimentDeadline(id, endDate) {
        const current = stateRef.current.experiments.find((e) => e.id === id);
        if (current && endDate < current.startDate) throw new Error("예정 종료일은 시작일 이후여야 합니다.");
        demo.extendExperimentDeadline(id, endDate);
      },
      async setExperimentEmailNotify(id, on) {
        demo.setExperimentEmailNotify(id, on);
      },
      async toggleChecklistItem(experimentId, itemId, done) {
        demo.toggleChecklistItem(experimentId, itemId, done);
      },
      async addChecklistItem(experimentId, title) {
        if (!title.trim()) throw new Error("체크리스트 내용을 입력해 주세요.");
        demo.addChecklistItem(experimentId, title.trim());
      },
      async deleteChecklistItem(experimentId, itemId) {
        demo.deleteChecklistItem(experimentId, itemId);
      },

      async saveReport(experimentId, v) {
        const parsed = check(experimentReportInputSchema, v);
        demo.saveReport(experimentId, clean({ ...parsed, finishExperiment: parsed.finishExperiment ?? false }));
      },
      async createNextChallengeFromReport(experimentId, v) {
        const parsed = check(challengeInputSchema, v);
        return { id: demo.createNextChallengeFromReport(experimentId, parsed) };
      },
    };

    return { mode: "demo", paths: makePaths("/demo"), actions };
  }, [demo]);

  return <AppDataProvider value={value}>{children}</AppDataProvider>;
}
