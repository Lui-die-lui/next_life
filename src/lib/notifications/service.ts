import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { sendMail, isMailConfigured } from "@/lib/mail/transport";
import { renderDeadlineEmail } from "@/lib/mail/templates";

const MAX_ATTEMPTS = 5;
const DEFAULT_BATCH_SIZE = 20; // keep well under Gmail's per-day sending limits
const RETRY_BACKOFF_MINUTES = [5, 15, 60, 240, 1440];

/** Called whenever an experiment's schedule changes so stale pending alerts don't fire late. */
export async function cancelStaleNotificationJobs(experimentId: string, currentScheduleVersion: number) {
  await prisma.notificationJob.updateMany({
    where: {
      experimentId,
      status: "PENDING",
      scheduleVersion: { lt: currentScheduleVersion },
    },
    data: { status: "CANCELED" },
  });
}

function dueExperimentsWhere(now: Date): Prisma.ExperimentWhereInput {
  return {
    endDate: { lte: now },
    status: { in: ["IN_PROGRESS", "RETRO_PENDING"] },
    emailNotifyOn: true,
    report: null,
    user: { notificationSetting: { emailEnabled: true } },
  };
}

export interface NotificationRunResult {
  mailConfigured: boolean;
  processed: number;
  sent: number;
  failed: number;
  canceled: number;
  skipped: number;
  previews: { experimentId: string; to: string; subject: string; text: string }[];
}

/**
 * The cron entrypoint's core logic. Re-checks eligibility right before
 * sending, claims each job atomically (status PENDING -> SENDING guarded by
 * a conditional updateMany), and records success/failure/attempts so retries
 * and concurrent runs never double-send. When SMTP isn't configured, this
 * only previews -- it never touches job rows, so nothing is ever recorded as
 * sent.
 */
export async function runDueNotifications(options?: { limit?: number }): Promise<NotificationRunResult> {
  const now = new Date();
  const limit = options?.limit ?? DEFAULT_BATCH_SIZE;
  const mailConfigured = isMailConfigured();

  const result: NotificationRunResult = {
    mailConfigured,
    processed: 0,
    sent: 0,
    failed: 0,
    canceled: 0,
    skipped: 0,
    previews: [],
  };

  const dueExperiments = await prisma.experiment.findMany({
    where: dueExperimentsWhere(now),
    include: { user: { include: { notificationSetting: true } } },
    take: limit,
    orderBy: { endDate: "asc" },
  });
  if (!mailConfigured) {
    for (const experiment of dueExperiments) {
      const { subject, text } = renderDeadlineEmail({
        experimentTitle: experiment.title,
        reportUrl: `${process.env.APP_URL}/experiments/${experiment.id}/report`,
        appSettingsUrl: `${process.env.APP_URL}/settings`,
      });
      result.previews.push({ experimentId: experiment.id, to: experiment.user.email, subject, text });
    }
    result.processed = dueExperiments.length;
    return result;
  }

  for (const experiment of dueExperiments) {
    result.processed++;

    const job = await prisma.notificationJob.upsert({
      where: {
        experimentId_kind_scheduleVersion: {
          experimentId: experiment.id,
          kind: "EXPERIMENT_DEADLINE",
          scheduleVersion: experiment.scheduleVersion,
        },
      },
      create: {
        experimentId: experiment.id,
        kind: "EXPERIMENT_DEADLINE",
        scheduleVersion: experiment.scheduleVersion,
        status: "PENDING",
        // Explicit, not the column default: a DB-generated default() would
        // be a few ms *after* the `now` captured above, which made a
        // brand-new job's own nextAttemptAt > now and skip it immediately.
        nextAttemptAt: now,
      },
      update: {},
    });

    if (job.status !== "PENDING" || job.nextAttemptAt > now) {
      result.skipped++;
      continue;
    }

    // Atomically claim: only one concurrent run can move PENDING -> SENDING.
    const claim = await prisma.notificationJob.updateMany({
      where: { id: job.id, status: "PENDING" },
      data: { status: "SENDING", attempts: { increment: 1 } },
    });
    if (claim.count !== 1) {
      result.skipped++;
      continue;
    }

    // Re-confirm the freshest deadline/status/settings right before sending.
    const fresh = await prisma.experiment.findUnique({
      where: { id: experiment.id },
      include: { user: { include: { notificationSetting: true } }, report: true },
    });
    const stillDue =
      fresh &&
      fresh.endDate &&
      fresh.endDate.getTime() <= Date.now() &&
      (fresh.status === "IN_PROGRESS" || fresh.status === "RETRO_PENDING") &&
      fresh.emailNotifyOn &&
      fresh.scheduleVersion === experiment.scheduleVersion &&
      !fresh.report &&
      fresh.user.notificationSetting?.emailEnabled;

    if (!stillDue || !fresh) {
      await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "CANCELED" } });
      result.canceled++;
      continue;
    }

    const { subject, text, html } = renderDeadlineEmail({
      experimentTitle: fresh.title,
      reportUrl: `${process.env.APP_URL}/experiments/${fresh.id}/report`,
      appSettingsUrl: `${process.env.APP_URL}/settings`,
    });

    try {
      const sendResult = await sendMail({ to: fresh.user.email, subject, text, html });
      if (!sendResult.sent) throw new Error("SMTP not configured");
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      result.sent++;
    } catch (err) {
      const attempts = job.attempts + 1;
      const isFinal = attempts >= MAX_ATTEMPTS;
      const backoffMinutes = RETRY_BACKOFF_MINUTES[Math.min(attempts - 1, RETRY_BACKOFF_MINUTES.length - 1)];
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: {
          status: isFinal ? "FAILED" : "PENDING",
          lastError: err instanceof Error ? err.message : String(err),
          nextAttemptAt: new Date(Date.now() + backoffMinutes * 60_000),
        },
      });
      result.failed++;
    }
  }

  return result;
}
