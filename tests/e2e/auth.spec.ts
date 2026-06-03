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

  for (const path of ["/", "/companies", "/tasks"]) {
    test(`redirects ${path} to /login when signed out`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login$/);
      await expect(
        page.getByRole("heading", { name: "ログイン" }),
      ).toBeVisible();
    });
  }
});
