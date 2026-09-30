"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { experienceInputSchema, type ExperienceInput } from "@/lib/domain/validation";

export async function createExperience(input: ExperienceInput) {
  const user = await requireUser();
  const data = experienceInputSchema.parse(input);

  const experience = await prisma.experience.create({
    data: { ...data, userId: user.id },
  });

  revalidatePath("/experiences");
  return experience;
}

export async function updateExperience(id: string, input: ExperienceInput) {
  const user = await requireUser();
  const data = experienceInputSchema.parse(input);

  const existing = await prisma.experience.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("경험을 찾을 수 없습니다.");

  await prisma.experience.update({ where: { id }, data });
  revalidatePath("/experiences");
}

export async function deleteExperience(id: string) {
  const user = await requireUser();
  const existing = await prisma.experience.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("경험을 찾을 수 없습니다.");

  // LinkCardExperience.experienceId is onDelete: SetNull and already carries
  // a snapshot of this experience, so past link cards keep reading fine.
  await prisma.experience.delete({ where: { id } });
  revalidatePath("/experiences");
}

export async function listExperiences() {
  const user = await requireUser();
  return prisma.experience.findMany({
    where: { userId: user.id },
    orderBy: [{ field: "asc" }, { createdAt: "asc" }],
  });
}
