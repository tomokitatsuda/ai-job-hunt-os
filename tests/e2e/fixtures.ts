import { randomUUID } from "node:crypto";

import {
  expect,
  test as base,
  type Page,
} from "@playwright/test";

import {
  createTestSession,
  createTestUser,
  deleteTestUser,
} from "./database";

type AuthenticatedFixtures = {
  authenticatedPage: Page;
  userId: string;
};

export const test = base.extend<AuthenticatedFixtures>({
  userId: async ({}, provide) => {
    const userId = await createTestUser();

    try {
      await provide(userId);
    } finally {
      await deleteTestUser(userId);
    }
  },
  authenticatedPage: async ({ context, page, userId }, provide) => {
    const sessionToken = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await createTestSession(userId, sessionToken, expires);
    await context.addCookies([
      {
        name: "authjs.session-token",
        value: sessionToken,
        url: "http://localhost:3000",
        expires: Math.floor(expires.getTime() / 1000),
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
      },
    ]);

    await provide(page);
  },
});

export { expect };
