"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  experimentReportInputSchema,
  isValidExperimentTransition,
  type ExperimentReportInput,
} from "@/lib/domain/validation";

export async function saveExperimentReport(experimentId: string, input: ExperimentReportInput) {
  const user = await requireUser();
  const data = experimentReportInputSchema.parse(input);

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) throw new Error("실험을 찾을 수 없습니다.");

  const reportFields = {
    whatYouDid: data.whatYouDid,
    observedResult: data.observedResult,
    helpfulness: data.helpfulness,
    helpfulEvidence: data.helpfulEvidence,
    mismatchedConditions: data.mismatchedConditions,
    whatToChangeNext: data.whatToChangeNext,
    nextChallengeMethod: data.nextChallengeMethod,
    quantResult: data.quantResult,
  };

  await prisma.$transaction(async (tx) => {
    await tx.experimentReport.upsert({
      where: { experimentId },
      create: { experimentId, ...reportFields },
      update: reportFields,
    });

    if (data.finishExperiment && isValidExperimentTransition(experiment.status, "DONE")) {
      await tx.experiment.update({ where: { id: experimentId }, data: { status: "DONE" } });
    }
  });

  revalidatePath(`/experiments/${experimentId}`);
  revalidatePath(`/experiments/${experimentId}/report`);
}

/** "이 경험으로 다음 도전 만들기": seeds a new Challenge from what the report learned. */
export async function createNextChallengeFromReport(experimentId: string, input: {
  title: string;
  field: string;
  goalOrProblem: string;
}) {
  const user = await requireUser();
  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
    include: { report: true },
  });
  if (!experiment) throw new Error("실험을 찾을 수 없습니다.");
  if (!experiment.report) throw new Error("먼저 실험 보고서를 작성해 주세요.");

  const title = input.title.trim();
  const field = input.field.trim();
  const goalOrProblem = input.goalOrProblem.trim();
  if (!title || !field || !goalOrProblem) {
    throw new Error("필수 입력 항목입니다.");
  }

  const challenge = await prisma.$transaction(async (tx) => {
    const created = await tx.challenge.create({
      data: { userId: user.id, title, field, goalOrProblem, status: "IDEA" },
    });
    await tx.experimentReport.update({
      where: { experimentId },
      data: { nextChallengeId: created.id },
    });
    return created;
  });

  revalidatePath(`/experiments/${experimentId}`);
  revalidatePath("/challenges");
  return challenge;
}
