import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// These hit the real (Supabase) database configured in SUPABASE_CONNECTION_KEY,
// using two throwaway users created just for this run. next/cache and the
// session helper are mocked because they depend on a live Next.js request
// scope that doesn't exist under a plain test runner -- everything else
// (validation, Prisma queries, ownership checks) runs for real.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: vi.fn() }));

import { requireUser } from "@/lib/session";
import { createExperience, updateExperience, deleteExperience } from "./experiences";
import { createChallenge, getChallengeDetail } from "./challenges";
import { createLinkCard } from "./link-cards";

const mockRequireUser = vi.mocked(requireUser);

const USER_A = { id: `test-user-a-${Date.now()}`, email: `a-${Date.now()}@test.local`, name: "Test A" };
const USER_B = { id: `test-user-b-${Date.now()}`, email: `b-${Date.now()}@test.local`, name: "Test B" };

function asUser(user: typeof USER_A) {
  mockRequireUser.mockResolvedValue(user as never);
}

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: USER_A.id, email: USER_A.email, name: USER_A.name, emailVerified: true },
      { id: USER_B.id, email: USER_B.email, name: USER_B.name, emailVerified: true },
    ],
  });
});

afterAll(async () => {
  // Cascades: deleting the user removes their experiences/challenges/link
  // cards/experiments/reports/notification settings too.
  await prisma.user.deleteMany({ where: { id: { in: [USER_A.id, USER_B.id] } } });
  await prisma.$disconnect();
});

describe("cross-user ownership checks", () => {
  it("blocks user B from updating user A's experience", async () => {
    asUser(USER_A);
    const experience = await createExperience({
      field: "음악",
      title: "테스트 경험",
      whatYouDid: "테스트",
      status: "COMPLETED",
    });

    asUser(USER_B);
    await expect(
      updateExperience(experience.id, {
        field: "음악",
        title: "변경 시도",
        whatYouDid: "변경",
        status: "COMPLETED",
      })
    ).rejects.toThrow();
  });

  it("blocks user B from deleting user A's experience", async () => {
    asUser(USER_A);
    const experience = await createExperience({
      field: "개발",
      title: "삭제 대상 경험",
      whatYouDid: "테스트",
      status: "COMPLETED",
    });

    asUser(USER_B);
    await expect(deleteExperience(experience.id)).rejects.toThrow();

    asUser(USER_A);
    const stillThere = await prisma.experience.findUnique({ where: { id: experience.id } });
    expect(stillThere).not.toBeNull();
  });

  it("blocks user B from reading user A's challenge detail", async () => {
    asUser(USER_A);
    const challenge = await createChallenge({
      title: "테스트 도전",
      field: "개발",
      goalOrProblem: "테스트 목표",
    });

    asUser(USER_B);
    await expect(getChallengeDetail(challenge.id)).rejects.toThrow();
  });

  it("blocks user B from linking their card to user A's challenge", async () => {
    asUser(USER_A);
    const challenge = await createChallenge({
      title: "링크 테스트 도전",
      field: "개발",
      goalOrProblem: "테스트 목표",
    });

    asUser(USER_B);
    // B's own experience, so the input itself is valid and only ownership can reject it.
    const ownExperience = await createExperience({
      field: "개발",
      title: "B의 경험",
      whatYouDid: "테스트",
      status: "COMPLETED",
    });
    await expect(
      createLinkCard({ challengeId: challenge.id, experienceIds: [ownExperience.id], status: "REVIEWING" })
    ).rejects.toThrow("도전을 찾을 수 없습니다.");
  });

  it("blocks user B from linking user A's experience into their own card", async () => {
    asUser(USER_A);
    const experience = await createExperience({
      field: "개발",
      title: "A의 경험",
      whatYouDid: "테스트",
      status: "COMPLETED",
    });

    asUser(USER_B);
    const ownChallenge = await createChallenge({
      title: "B의 도전",
      field: "개발",
      goalOrProblem: "테스트 목표",
    });
    await expect(
      createLinkCard({ challengeId: ownChallenge.id, experienceIds: [experience.id], status: "REVIEWING" })
    ).rejects.toThrow();
  });
});
