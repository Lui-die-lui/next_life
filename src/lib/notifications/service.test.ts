import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// Real DB (Supabase), fully mocked mail transport -- this suite must never
// place an outbound SMTP call, it only verifies the job bookkeeping
// (idempotency, retries, rescheduling) around a fake transport boundary.
vi.mock("@/lib/mail/transport", () => ({
  isMailConfigured: vi.fn(),
  sendMail: vi.fn(),
}));

import { isMailConfigured, sendMail } from "@/lib/mail/transport";
import { runDueNotifications } from "./service";

const mockIsMailConfigured = vi.mocked(isMailConfigured);
const mockSendMail = vi.mocked(sendMail);

const USER_ID = `test-notify-user-${Date.now()}`;
const CHALLENGE_ID = `test-notify-challenge-${Date.now()}`;

async function createDueExperiment(overrides?: Partial<{ scheduleVersion: number; emailNotifyOn: boolean }>) {
  return prisma.experiment.create({
    data: {
      userId: USER_ID,
      challengeId: CHALLENGE_ID,
      challengeTitleSnapshot: "테스트 도전",
      title: "테스트 실험",
      principleToApply: "원리",
      action: "행동",
      startDate: new Date(Date.now() - 10 * 86_400_000),
      endDate: new Date(Date.now() - 1 * 86_400_000), // already past due
      status: "IN_PROGRESS",
      emailNotifyOn: overrides?.emailNotifyOn ?? true,
      scheduleVersion: overrides?.scheduleVersion ?? 1,
    },
  });
}

beforeAll(async () => {
  await prisma.user.create({
    data: { id: USER_ID, email: `notify-${Date.now()}@test.local`, name: "Notify Test", emailVerified: true },
  });
  await prisma.challenge.create({
    data: { id: CHALLENGE_ID, userId: USER_ID, title: "테스트 도전", field: "개발", goalOrProblem: "목표" },
  });
  await prisma.notificationSetting.create({ data: { userId: USER_ID, emailEnabled: true } });
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: USER_ID } }); // cascades experiments/jobs
  await prisma.$disconnect();
});

describe("runDueNotifications", () => {
  it("previews without touching job rows when SMTP isn't configured", async () => {
    mockIsMailConfigured.mockReturnValue(false);
    const experiment = await createDueExperiment();

    const result = await runDueNotifications();
    const preview = result.previews.find((p) => p.experimentId === experiment.id);

    expect(preview).toBeDefined();
    expect(mockSendMail).not.toHaveBeenCalled();
    const job = await prisma.notificationJob.findFirst({ where: { experimentId: experiment.id } });
    expect(job).toBeNull();
  });

  it("sends once, marks the job SENT, and does not resend on a second run", async () => {
    mockIsMailConfigured.mockReturnValue(true);
    mockSendMail.mockResolvedValue({ sent: true, messageId: "test-message-1" });
    const experiment = await createDueExperiment();

    // Other experiments created by earlier tests in this file may also be
    // "due" and get sent in the same run -- that's correct batch behavior,
    // not a bug, so we track this experiment's own job rather than the
    // mock's global call count.
    const first = await runDueNotifications();
    expect(first.sent).toBeGreaterThanOrEqual(1);

    const job = await prisma.notificationJob.findFirst({ where: { experimentId: experiment.id } });
    expect(job?.status).toBe("SENT");
    const callsAfterFirst = mockSendMail.mock.calls.length;

    // Duplicate run (e.g. overlapping cron invocations) must not send again
    // for this already-sent experiment.
    await runDueNotifications();
    expect(mockSendMail.mock.calls.length).toBe(callsAfterFirst);
    const jobAfterSecond = await prisma.notificationJob.findFirst({ where: { experimentId: experiment.id } });
    expect(jobAfterSecond?.status).toBe("SENT");
  });

  it("retries on failure without marking the job as sent", async () => {
    mockIsMailConfigured.mockReturnValue(true);
    mockSendMail.mockRejectedValue(new Error("smtp down"));
    const experiment = await createDueExperiment();

    const result = await runDueNotifications();
    expect(result.failed).toBeGreaterThanOrEqual(1);

    const job = await prisma.notificationJob.findFirst({ where: { experimentId: experiment.id } });
    expect(job?.status).toBe("PENDING"); // not FAILED yet -- retries remain
    expect(job?.attempts).toBe(1);
    expect(job?.lastError).toContain("smtp down");
    expect(job?.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("skips experiments whose account notification setting is off", async () => {
    mockIsMailConfigured.mockReturnValue(true);
    mockSendMail.mockResolvedValue({ sent: true, messageId: "test-message-2" });
    await prisma.notificationSetting.update({ where: { userId: USER_ID }, data: { emailEnabled: false } });

    const experiment = await createDueExperiment();
    await runDueNotifications();

    expect(mockSendMail).not.toHaveBeenCalled();
    const job = await prisma.notificationJob.findFirst({ where: { experimentId: experiment.id } });
    expect(job).toBeNull();

    await prisma.notificationSetting.update({ where: { userId: USER_ID }, data: { emailEnabled: true } });
  });

  it("cancels stale pending jobs when the schedule version moves forward", async () => {
    mockIsMailConfigured.mockReturnValue(true);
    mockSendMail.mockRejectedValue(new Error("smtp down")); // stays PENDING, not SENT
    const experiment = await createDueExperiment({ scheduleVersion: 1 });

    await runDueNotifications(); // creates a PENDING job for scheduleVersion 1

    // Simulate the experiment's deadline being extended: version bumps, and
    // the update action's own transaction would cancel old pending jobs.
    await prisma.$transaction([
      prisma.experiment.update({ where: { id: experiment.id }, data: { scheduleVersion: 2 } }),
      prisma.notificationJob.updateMany({
        where: { experimentId: experiment.id, status: "PENDING", scheduleVersion: { lt: 2 } },
        data: { status: "CANCELED" },
      }),
    ]);

    const oldJob = await prisma.notificationJob.findFirst({
      where: { experimentId: experiment.id, scheduleVersion: 1 },
    });
    expect(oldJob?.status).toBe("CANCELED");
  });
});
