"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/**
 * Permanently deletes the signed-in account. The caller must retype the
 * account's email as confirmation; the check runs here on the server, not
 * only in the form.
 *
 * Deleting the User row cascades (see prisma/schema.prisma) to sessions,
 * OAuth accounts, notification settings, experiences, challenges, link
 * cards, experiments, checklists, reports and notification jobs, so no
 * record of this user remains and no pending reminder email can be sent.
 */
export async function deleteAccount(confirmEmail: string) {
  const user = await requireUser();
  if (confirmEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    throw new Error("입력한 이메일이 계정 이메일과 일치하지 않습니다.");
  }

  await prisma.user.delete({ where: { id: user.id } });

  // The session row is already gone; also drop the auth cookies so the
  // browser stops presenting a dead session to the proxy's cookie check.
  const store = await cookies();
  for (const c of store.getAll()) {
    if (c.name.includes("better-auth")) store.delete(c.name);
  }

  return { ok: true as const };
}
