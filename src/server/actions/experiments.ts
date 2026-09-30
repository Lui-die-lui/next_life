"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  experimentInputSchema,
  isValidExperimentTransition,
  type ExperimentInput,
} from "@/lib/domain/validation";
import type { ExperimentStatus } from "@/lib/domain/types";

export async function createExperiment(input: ExperimentInput) {
  const user = await requireUser();
  const data = experimentInputSchema.parse(input);

  const challenge = await prisma.challenge.findFirst({
    where: { id: data.challengeId, userId: user.id },
  });
  if (!challenge) throw new Error("도전을 찾을 수 없습니다.");

  if (data.linkCardId) {
    const linkCard = await prisma.linkCard.findFirst({
      where: { id: data.linkCardId, userId: user.id, challengeId: challenge.id },
    });
    if (!linkCard) throw new Error("연결 카드를 찾을 수 없습니다.");
  }

  const experiment = await prisma.experiment.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
      challengeTitleSnapshot: challenge.title,
      linkCardId: data.linkCardId,
      title: data.title,
      principleToApply: data.principleToApply,
      action: data.action,
      observationTargets: data.observationTargets,
      successCriteria: data.successCriteria,
      startDate: data.startDate,
      endDate: data.endDate,
      emailNotifyOn: data.emailNotifyOn,
      checklist: {
        create: data.checklist.map((title, order) => ({ title, order })),
      },
    },
  });

  revalidatePath(`/challenges/${challenge.id}`);
  return experiment;
}

interface UpdateExperimentScheduleInput {
  title: string;
  principleToApply: string;
  action: string;
  observationTargets?: string;
  successCriteria?: string;
  startDate: Date;
  endDate?: Date | null;
  emailNotifyOn: boolean;
}

export async function updateExperiment(id: string, input: UpdateExperimentScheduleInput) {
  const user = await requireUser();
  const existing = await prisma.experiment.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("실험을 찾을 수 없습니다.");
  if (input.endDate && input.endDate.getTime() < input.startDate.getTime()) {
    throw new Error("예정 종료일은 시작일 이후여야 합니다.");
  }

  const scheduleChanged =
    existing.startDate.getTime() !== input.startDate.getTime() ||
    (existing.endDate?.getTime() ?? null) !== (input.endDate?.getTime() ?? null);
  const nextVersion = scheduleChanged ? existing.scheduleVersion + 1 : existing.scheduleVersion;

  await prisma.$transaction(async (tx) => {
    await tx.experiment.update({
      where: { id },
      data: {
        title: input.title,
        principleToApply: input.principleToApply,
        action: input.action,
        observationTargets: input.observationTargets,
        successCriteria: input.successCriteria,
        startDate: input.startDate,
        endDate: input.endDate,
        emailNotifyOn: input.emailNotifyOn,
        scheduleVersion: nextVersion,
      },
    });
    if (scheduleChanged) {
      await tx.notificationJob.updateMany({
        where: { experimentId: id, status: "PENDING", scheduleVersion: { lt: nextVersion } },
        data: { status: "CANCELED" },
      });
    }
  });

  revalidatePath(`/experiments/${id}`);
}

export async function updateExperimentStatus(id: string, status: ExperimentStatus) {
  const user = await requireUser();
  const existing = await prisma.experiment.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("실험을 찾을 수 없습니다.");
  if (!isValidExperimentTransition(existing.status, status)) {
    throw new Error("허용되지 않는 상태 변경입니다.");
  }

  await prisma.experiment.update({ where: { id }, data: { status } });
  revalidatePath(`/experiments/${id}`);
}

export async function extendExperimentDeadline(id: string, newEndDate: Date) {
  const user = await requireUser();
  const existing = await prisma.experiment.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("실험을 찾을 수 없습니다.");
  if (newEndDate.getTime() < existing.startDate.getTime()) {
    throw new Error("예정 종료일은 시작일 이후여야 합니다.");
  }

  const nextVersion = existing.scheduleVersion + 1;
  await prisma.$transaction(async (tx) => {
    await tx.experiment.update({
      where: { id },
      data: {
        endDate: newEndDate,
        scheduleVersion: nextVersion,
        status: existing.status === "RETRO_PENDING" ? "IN_PROGRESS" : existing.status,
      },
    });
    await tx.notificationJob.updateMany({
      where: { experimentId: id, status: "PENDING", scheduleVersion: { lt: nextVersion } },
      data: { status: "CANCELED" },
    });
  });

  revalidatePath(`/experiments/${id}`);
}

export async function toggleChecklistItem(itemId: string, done: boolean) {
  const user = await requireUser();
  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, experiment: { userId: user.id } },
    include: { experiment: true },
  });
  if (!item) throw new Error("체크리스트 항목을 찾을 수 없습니다.");

  await prisma.checklistItem.update({ where: { id: itemId }, data: { done } });
  revalidatePath(`/experiments/${item.experimentId}`);
}

export async function addChecklistItem(experimentId: string, title: string) {
  const user = await requireUser();
  const experiment = await prisma.experiment.findFirst({ where: { id: experimentId, userId: user.id } });
  if (!experiment) throw new Error("실험을 찾을 수 없습니다.");
  const trimmed = title.trim();
  if (!trimmed) throw new Error("체크리스트 내용을 입력해 주세요.");

  const count = await prisma.checklistItem.count({ where: { experimentId } });
  await prisma.checklistItem.create({ data: { experimentId, title: trimmed, order: count } });
  revalidatePath(`/experiments/${experimentId}`);
}

export async function deleteChecklistItem(itemId: string) {
  const user = await requireUser();
  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, experiment: { userId: user.id } },
  });
  if (!item) throw new Error("체크리스트 항목을 찾을 수 없습니다.");

  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/experiments/${item.experimentId}`);
}

export async function listHomeExperiments() {
  const user = await requireUser();
  return prisma.experiment.findMany({
    where: { userId: user.id, status: { in: ["PREP", "IN_PROGRESS", "RETRO_PENDING"] } },
    include: { checklist: true, challenge: true, report: { select: { id: true } } },
    orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getExperimentDetail(id: string) {
  const user = await requireUser();
  const experiment = await prisma.experiment.findFirst({
    where: { id, userId: user.id },
    include: {
      checklist: { orderBy: { order: "asc" } },
      report: true,
      challenge: true,
      linkCard: true,
    },
  });
  if (!experiment) throw new Error("실험을 찾을 수 없습니다.");
  return experiment;
}
