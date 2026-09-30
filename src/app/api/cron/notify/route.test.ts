import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/notifications/service", () => ({
  runDueNotifications: vi.fn().mockResolvedValue({
    mailConfigured: false,
    processed: 0,
    sent: 0,
    failed: 0,
    canceled: 0,
    skipped: 0,
    previews: [],
  }),
}));

const ORIGINAL_SECRET = process.env.CRON_SECRET;

beforeEach(() => {
  process.env.CRON_SECRET = "test-cron-secret";
});

afterEach(() => {
  process.env.CRON_SECRET = ORIGINAL_SECRET;
  vi.clearAllMocks();
});

describe("GET /api/cron/notify", () => {
  it("rejects a request with no secret", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/cron/notify");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("rejects a request with the wrong secret", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/cron/notify?secret=wrong");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("rejects every request when CRON_SECRET isn't configured on the server", async () => {
    process.env.CRON_SECRET = "";
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/cron/notify?secret=");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("accepts the correct secret via the Authorization header", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/cron/notify", {
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("accepts the correct secret via the query string (for simple external cron pings)", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/cron/notify?secret=test-cron-secret");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
