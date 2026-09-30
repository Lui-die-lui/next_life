"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  linkCardInputSchema,
  type LinkCardInput,
  type LinkCardUpdateInput,
} from "@/lib/domain/validation";

export async function createLinkCard(input: LinkCardInput) {
  const user = await requireUser();
  const data = linkCardInputSchema.parse(input);

  const challenge = await prisma.challenge.findFirst({
    where: { id: data.challengeId, userId: user.id },
  });
  if (!challenge) throw new Error("도전을 찾을 수 없습니다.");

  const experiences =
    data.experienceIds.length > 0
      ? await prisma.experience.findMany({
          where: { id: { in: data.experienceIds }, userId: user.id },
        })
      : [];
  if (experiences.length !== data.experienceIds.length) {
    throw new Error("본인의 경험만 연결할 수 있습니다.");
  }

  const linkCard = await prisma.linkCard.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
      challengeTitleSnapshot: challenge.title,
      status: data.status,
      previousProblem: data.previousProblem,
      solutionPrinciple: data.solutionPrinciple,
      applyTarget: data.applyTarget,
      commonGround: data.commonGround,
      differences: data.differences,
      verifyQuestion: data.verifyQuestion,
      noLinkReason: data.noLinkReason,
      experiences: {
        create: experiences.map((exp) => ({
          experienceId: exp.id,
          experienceTitleSnapshot: exp.title,
          experienceFieldSnapshot: exp.field,
          experienceStatusSnapshot: exp.status,
          experienceProgressSnapshot: exp.progress,
        })),
      },
    },
  });

  revalidatePath(`/challenges/${challenge.id}`);
  return linkCard;
}

export async function updateLinkCard(id: string, input: LinkCardUpdateInput) {
  const user = await requireUser();
  const existing = await prisma.linkCard.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("연결 카드를 찾을 수 없습니다.");

  const data = linkCardInputSchema.parse({ ...input, challengeId: existing.challengeId });

  const experiences =
    data.experienceIds.length > 0
      ? await prisma.experience.findMany({
          where: { id: { in: data.experienceIds }, userId: user.id },
        })
      : [];
  if (experiences.length !== data.experienceIds.length) {
    throw new Error("본인의 경험만 연결할 수 있습니다.");
  }

  await prisma.$transaction([
    prisma.linkCardExperience.deleteMany({ where: { linkCardId: id } }),
    prisma.linkCard.update({
      where: { id },
      data: {
        status: data.status,
        previousProblem: data.previousProblem,
        solutionPrinciple: data.solutionPrinciple,
        applyTarget: data.applyTarget,
        commonGround: data.commonGround,
        differences: data.differences,
        verifyQuestion: data.verifyQuestion,
        noLinkReason: data.noLinkReason,
        experiences: {
          create: experiences.map((exp) => ({
            experienceId: exp.id,
            experienceTitleSnapshot: exp.title,
            experienceFieldSnapshot: exp.field,
            experienceStatusSnapshot: exp.status,
            experienceProgressSnapshot: exp.progress,
          })),
        },
      },
    }),
  ]);

  revalidatePath(`/challenges/${existing.challengeId}`);
  revalidatePath(`/link-cards/${id}`);
}

export async function deleteLinkCard(id: string) {
  const user = await requireUser();
  const existing = await prisma.linkCard.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("연결 카드를 찾을 수 없습니다.");

  await prisma.linkCard.delete({ where: { id } });
  revalidatePath(`/challenges/${existing.challengeId}`);
}

export async function getLinkCardDetail(id: string) {
  const user = await requireUser();
  const linkCard = await prisma.linkCard.findFirst({
    where: { id, userId: user.id },
    include: { experiences: true, challenge: true },
  });
  if (!linkCard) throw new Error("연결 카드를 찾을 수 없습니다.");
  return linkCard;
}
