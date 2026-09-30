"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function setAccountEmailEnabled(emailEnabled: boolean) {
  const user = await requireUser();
  await prisma.notificationSetting.upsert({
    where: { userId: user.id },
    create: { userId: user.id, emailEnabled },
    update: { emailEnabled },
  });
  revalidatePath("/settings");
}

export async function setExperimentEmailNotify(experimentId: string, emailNotifyOn: boolean) {
  const user = await requireUser();
  const experiment = await prisma.experiment.findFirst({ where: { id: experimentId, userId: user.id } });
  if (!experiment) throw new Error("실험을 찾을 수 없습니다.");

  await prisma.experiment.update({ where: { id: experimentId }, data: { emailNotifyOn } });
  revalidatePath(`/experiments/${experimentId}`);
}

export async function getAccountSettings() {
  const user = await requireUser();
  const setting = await prisma.notificationSetting.findUnique({ where: { userId: user.id } });
  return {
    email: user.email,
    emailEnabled: setting?.emailEnabled ?? true,
  };
}
