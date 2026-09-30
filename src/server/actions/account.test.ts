import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// Hits the real database with a throwaway user, like ownership.test.ts.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: vi.fn() }));
const deletedCookies: string[] = [];
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [{ name: "better-auth.session_token" }, { name: "other" }],
    delete: (name: string) => deletedCookies.push(name),
  }),
}));

import { requireUser } from "@/lib/session";
import { deleteAccount } from "./account";
import { createExperience } from "./experiences";
import { createChallenge } from "./challenges";

const stamp = Date.now();
const USER = { id: `test-del-${stamp}`, email: `del-${stamp}@test.local`, name: "Delete Me" };
const OTHER = { id: `test-keep-${stamp}`, email: `keep-${stamp}@test.local`, name: "Keep Me" };

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { ...USER, emailVerified: true },
      { ...OTHER, emailVerified: true },
    ],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [USER.id, OTHER.id] } } });
  await prisma.$disconnect();
});

describe("deleteAccount", () => {
  it("refuses when the confirmation email does not match", async () => {
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    await expect(deleteAccount("wrong@test.local")).rejects.toThrow();
    expect(await prisma.user.findUnique({ where: { id: USER.id } })).not.toBeNull();
  });

  it("deletes the user and all of their records, and only theirs", async () => {
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    await createExperience({ field: "음악", title: "삭제될 경험", whatYouDid: "테스트", status: "COMPLETED" });
    await createChallenge({ title: "삭제될 도전", field: "교육", goalOrProblem: "테스트" });

    vi.mocked(requireUser).mockResolvedValue(OTHER as never);
    await createExperience({ field: "개발", title: "남을 경험", whatYouDid: "테스트", status: "COMPLETED" });

    vi.mocked(requireUser).mockResolvedValue(USER as never);
    await deleteAccount(`  ${USER.email.toUpperCase()} `);

    expect(await prisma.user.findUnique({ where: { id: USER.id } })).toBeNull();
    expect(await prisma.experience.count({ where: { userId: USER.id } })).toBe(0);
    expect(await prisma.challenge.count({ where: { userId: USER.id } })).toBe(0);
    expect(await prisma.experience.count({ where: { userId: OTHER.id } })).toBe(1);
    expect(deletedCookies).toEqual(["better-auth.session_token"]);
  });
});
