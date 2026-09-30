"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  challengeInputSchema,
  isValidChallengeTransition,
  type ChallengeInput,
} from "@/lib/domain/validation";
import type { ChallengeStatus } from "@/lib/domain/types";

export async function createChallenge(input: ChallengeInput) {
  const user = await requireUser();
  const data = challengeInputSchema.parse(input);

  const challenge = await prisma.challenge.create({
    data: { ...data, userId: user.id },
  });

  revalidatePath("/challenges");
  return challenge;
}

export async function updateChallenge(id: string, input: ChallengeInput) {
  const user = await requireUser();
  const data = challengeInputSchema.parse(input);

  const existing = await prisma.challenge.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("도전을 찾을 수 없습니다.");

  await prisma.challenge.update({ where: { id }, data });
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${id}`);
}

export async function updateChallengeStatus(id: string, status: ChallengeStatus) {
  const user = await requireUser();
  const existing = await prisma.challenge.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("도전을 찾을 수 없습니다.");
  if (!isValidChallengeTransition(existing.status, status)) {
    throw new Error("허용되지 않는 상태 변경입니다.");
  }

  await prisma.challenge.update({ where: { id }, data: { status } });
  revalidatePath("/challenges");
  revalidatePath(`/challenges/${id}`);
}

export async function deleteChallenge(id: string) {
  const user = await requireUser();
  const existing = await prisma.challenge.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("도전을 찾을 수 없습니다.");

  await prisma.challenge.delete({ where: { id } });
  revalidatePath("/challenges");
}

export async function listChallenges() {
  const user = await requireUser();
  return prisma.challenge.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChallengeDetail(id: string) {
  const user = await requireUser();
  const challenge = await prisma.challenge.findFirst({
    where: { id, userId: user.id },
    include: {
      linkCards: {
        include: { experiences: true },
        orderBy: { createdAt: "desc" },
      },
      experiments: {
        include: { checklist: true, report: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!challenge) throw new Error("도전을 찾을 수 없습니다.");
  return challenge;
}

/** Challenge list with the experiment/link-card context the list rows show. */
export async function listChallengeOverview() {
  const user = await requireUser();
  return prisma.challenge.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      experiments: {
        include: { checklist: true, report: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { linkCards: true } },
    },
  });
}
