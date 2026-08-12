import { expect, test } from "@playwright/test";

test.describe("health checks", () => {
  test("liveness reports that the application process is running", async ({
    request,
  }) => {
    const response = await request.get("/api/health/live");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({
      status: "ok",
      revision: process.env.APP_REVISION ?? "unknown",
    });
  });

  test("readiness reports that PostgreSQL is reachable", async ({ request }) => {
    const response = await request.get("/api/health/ready");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({
      status: "ok",
      checks: { database: "ok" },
    });
  });
});
