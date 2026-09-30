import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/**
 * Exports only the signed-in user's own app records: experiences, challenges,
 * link cards, experiments, checklists, reports, and notification settings.
 * Deliberately excludes anything auth/session/OAuth/SMTP related, and never
 * touches another user's data -- everything below is scoped by userId from
 * the server session, never from a client-supplied id.
 */
export async function GET() {
  const user = await requireUser();

  const [experiences, challenges, linkCards, experiments, notificationSetting] = await Promise.all([
    prisma.experience.findMany({ where: { userId: user.id } }),
    prisma.challenge.findMany({ where: { userId: user.id } }),
    prisma.linkCard.findMany({
      where: { userId: user.id },
      include: { experiences: true },
    }),
    prisma.experiment.findMany({
      where: { userId: user.id },
      include: { checklist: true, report: true },
    }),
    prisma.notificationSetting.findUnique({ where: { userId: user.id } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, name: user.name },
    experiences,
    challenges,
    linkCards: linkCards.map((card) => ({
      ...card,
      experiences: card.experiences.map((e) => ({
        experienceId: e.experienceId,
        titleSnapshot: e.experienceTitleSnapshot,
        fieldSnapshot: e.experienceFieldSnapshot,
        statusSnapshot: e.experienceStatusSnapshot,
        progressSnapshot: e.experienceProgressSnapshot,
      })),
    })),
    experiments,
    notificationSetting: notificationSetting
      ? { emailEnabled: notificationSetting.emailEnabled, timezone: notificationSetting.timezone }
      : null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="next-life-export-${Date.now()}.json"`,
    },
  });
}
