import { NextRequest, NextResponse } from "next/server";
import { runDueNotifications } from "@/lib/notifications/service";

// Function region is set globally in vercel.json ("regions": ["icn1"]) to
// stay close to the Seoul-region Supabase database.

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

/**
 * Scheduled notification endpoint. Runs on a daily cron (see vercel.json).
 * Never sends unauthenticated -- a request without the right CRON_SECRET
 * gets a 401 and nothing runs. See src/lib/notifications/service.ts for the
 * actual due-experiment query, atomic job claiming, and retry bookkeeping.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runDueNotifications();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
