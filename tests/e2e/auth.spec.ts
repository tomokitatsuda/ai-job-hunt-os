import { expect, test } from "@playwright/test";

test.describe("auth boundary", () => {
  test("/login is visible", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "ログイン" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "GitHubでログイン" }),
    ).toBeVisible();
  });

  for (const path of ["/", "/companies", "/companies/new", "/tasks"]) {
    test(`redirects ${path} to /login when signed out`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL((url) => {
        const callbackUrl = url.searchParams.get("callbackUrl");

        return (
          url.pathname === "/login" &&
          callbackUrl !== null &&
          new URL(callbackUrl).pathname === path
        );
      });
      await expect(
        page.getByRole("heading", { name: "ログイン" }),
      ).toBeVisible();
    });
  }
});
