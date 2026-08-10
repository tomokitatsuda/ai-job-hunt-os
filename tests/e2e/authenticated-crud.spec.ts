import { randomUUID } from "node:crypto";

import {
  createTestCompany,
  createTestInterviewLog,
  createTestTask,
  createTestUser,
  deleteTestUser,
  findTestInterviewLog,
  findTestTask,
} from "./database";
import { expect, test } from "./fixtures";

test.describe("authenticated onboarding and CRUD", () => {
  test("does not expose another user's application data", async ({
    authenticatedPage: page,
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const foreignUserId = await createTestUser();
    const foreignCompanyName = `Foreign Company ${suffix}`;
    const foreignTaskTitle = `Foreign Task ${suffix}`;
    const foreignInterviewType = `Foreign Interview ${suffix}`;

    try {
      const foreignCompany = await createTestCompany(
        foreignUserId,
        foreignCompanyName,
      );
      const foreignTask = await createTestTask(
        foreignUserId,
        foreignCompany.id,
        foreignTaskTitle,
      );
      const foreignInterviewLog = await createTestInterviewLog(
        foreignCompany.id,
        foreignInterviewType,
      );

      await page.goto("/");
      await expect(page.getByText(foreignCompanyName)).toHaveCount(0);
      await expect(page.getByText(foreignTaskTitle)).toHaveCount(0);
      await expect(page.getByText(foreignInterviewType)).toHaveCount(0);

      await page.goto("/companies");
      await expect(page.getByText(foreignCompanyName)).toHaveCount(0);

      await page.goto(`/companies/${foreignCompany.id}`);
      await expect(
        page.getByRole("heading", { name: "This page could not be found." }),
      ).toBeVisible();

      await page.goto(`/tasks/${foreignTask.id}/edit`);
      await expect(
        page.getByRole("heading", { name: "This page could not be found." }),
      ).toBeVisible();

      await page.goto(
        `/companies/${foreignCompany.id}/tasks/${foreignTask.id}/edit`,
      );
      await expect(
        page.getByRole("heading", { name: "This page could not be found." }),
      ).toBeVisible();

      await page.goto(
        `/companies/${foreignCompany.id}/interview-logs/${foreignInterviewLog.id}/edit`,
      );
      await expect(
        page.getByRole("heading", { name: "This page could not be found." }),
      ).toBeVisible();

      await page.goto("/tasks");
      await expect(page.getByText(foreignTaskTitle)).toHaveCount(0);
    } finally {
      await deleteTestUser(foreignUserId);
    }
  });

  test("creates starter data from the first-login dashboard", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "最初のデータを用意しましょう" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "スターターデータを作成" })
      .click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "最初のデータを用意しましょう" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "サンプル企業（編集してください）" }),
    ).toBeVisible();

    await page.goto("/tasks");
    await expect(
      page.getByRole("heading", {
        name: "募集要項と応募期限を確認する",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "職務経歴書・履歴書を更新する",
      }),
    ).toBeVisible();
  });

  test("creates, updates, and deletes a Company", async ({
    authenticatedPage: page,
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const companyName = `E2E Company ${suffix}`;
    const updatedCompanyName = `Updated Company ${suffix}`;

    await page.goto("/companies/new");
    await page.getByLabel("企業名").fill(companyName);
    await page.getByLabel("業界").fill("Software");
    await page.getByLabel("応募ポジション").fill("Frontend Engineer");
    await page.getByLabel("選考ステータス").selectOption("APPLIED");
    await page.getByLabel("次のアクション").fill("書類を提出する");
    await page.getByRole("button", { name: "企業を作成" }).click();

    await expect(page).toHaveURL(/\/companies\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: companyName }),
    ).toBeVisible();

    await page.getByRole("link", { name: "編集", exact: true }).click();
    await page.getByLabel("企業名").fill(updatedCompanyName);
    await page.getByLabel("選考ステータス").selectOption("FIRST_INTERVIEW");
    await page.getByRole("button", { name: "変更を保存" }).click();

    await expect(
      page.getByRole("heading", { name: updatedCompanyName }),
    ).toBeVisible();
    await expect(page.getByText("一次面接", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "企業を削除" }).click();

    await expect(page).toHaveURL(/\/companies$/);
    await expect(page.getByText(updatedCompanyName)).toHaveCount(0);
  });

  test("runs Task CRUD and changes its Company association", async ({
    authenticatedPage: page,
    userId,
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const [firstCompany, secondCompany] = await Promise.all([
      createTestCompany(userId, `First Company ${suffix}`),
      createTestCompany(userId, `Second Company ${suffix}`),
    ]);
    const taskTitle = `Prepare portfolio ${suffix}`;
    const updatedTaskTitle = `Polish portfolio ${suffix}`;

    await page.goto("/tasks");
    await page.getByLabel("タスク名").fill(taskTitle);
    await page.getByLabel("関連企業").selectOption(firstCompany.id);
    await page.getByLabel("メモ").fill("Created by authenticated E2E");
    await page.getByRole("button", { name: "タスクを追加" }).click();

    const taskCard = page.locator("article").filter({ hasText: taskTitle });
    await expect(taskCard).toContainText(firstCompany.name);
    await taskCard.getByRole("link", { name: "編集" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByLabel("タスク名").fill(updatedTaskTitle);
    await page.getByLabel("関連企業").selectOption(secondCompany.id);
    await page.getByRole("button", { name: "変更を保存" }).click();

    await expect
      .poll(() => findTestTask(userId))
      .toMatchObject({
        companyId: secondCompany.id,
        title: updatedTaskTitle,
      });

    const updatedTaskCard = page
      .locator("article")
      .filter({ hasText: updatedTaskTitle });
    await expect(updatedTaskCard).toContainText(secondCompany.name);
    await updatedTaskCard
      .getByRole("button", { name: "完了にする" })
      .click();
    await expect(
      page
        .locator("article")
        .filter({ hasText: updatedTaskTitle })
        .getByRole("button", { name: "未完了に戻す" }),
    ).toBeVisible();

    await page
      .locator("article")
      .filter({ hasText: updatedTaskTitle })
      .getByRole("button", { name: "削除" })
      .click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText(updatedTaskTitle)).toHaveCount(0);
  });

  test("runs InterviewLog CRUD inside an owned Company", async ({
    authenticatedPage: page,
    userId,
  }) => {
    const suffix = randomUUID().slice(0, 8);
    const company = await createTestCompany(
      userId,
      `Interview Company ${suffix}`,
    );
    const question = `Original interview question ${suffix}`;
    const updatedQuestion = `Updated interview question ${suffix}`;

    await page.goto(`/companies/${company.id}`);
    await page.getByLabel("面接日").fill("2026-09-01");
    await page.getByLabel("面接種別").fill("一次面接");
    await page.getByLabel("質問された内容").fill(question);
    await page.getByLabel("自分の回答メモ").fill("E2E answer memo");
    await page.getByRole("button", { name: "面接ログを追加" }).click();

    const interviewCard = page
      .locator("article")
      .filter({ hasText: question });
    await expect(interviewCard).toContainText("一次面接");
    await interviewCard.getByRole("link", { name: "編集" }).click();
    await page.waitForLoadState("networkidle");

    await page.getByLabel("質問された内容").fill(updatedQuestion);
    await page.getByLabel("面接種別").fill("二次面接");
    await page.getByRole("button", { name: "変更を保存" }).click();

    await expect
      .poll(() => findTestInterviewLog(company.id))
      .toMatchObject({
        interviewType: "二次面接",
        questions: updatedQuestion,
      });

    const updatedInterviewCard = page
      .locator("article")
      .filter({ hasText: updatedQuestion });
    await expect(updatedInterviewCard).toContainText("二次面接");
    await updatedInterviewCard.getByRole("button", { name: "削除" }).click();

    await expect(page).toHaveURL(new RegExp(`/companies/${company.id}$`));
    await expect(page.getByText(updatedQuestion)).toHaveCount(0);
  });
});
