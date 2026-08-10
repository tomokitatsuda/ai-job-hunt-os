import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { ApplicationStatus, PrismaClient } from "../src/generated/prisma/client";
import { assertSafeDatabaseTarget } from "../src/lib/database-safety";
import { DEMO_USER_ID } from "../src/lib/user-constants";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Set it in your environment or .env before running prisma db seed.",
  );
}

assertSafeDatabaseTarget(databaseUrl, {
  operation: "Prisma seed",
  allowRemote: process.env.ALLOW_REMOTE_SEED === "true",
});

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const demoUser = {
  id: DEMO_USER_ID,
  email: "demo@example.com",
  name: "Demo User",
};

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  await prisma.user.upsert({
    where: { id: demoUser.id },
    update: {
      email: demoUser.email,
      name: demoUser.name,
    },
    create: demoUser,
  });

  const companies = [
    {
      id: "company-001",
      name: "株式会社North Star AI",
      websiteUrl: "https://example.com/north-star-ai",
      industry: "AI SaaS",
      position: "フロントエンドエンジニア",
      status: ApplicationStatus.FIRST_INTERVIEW,
      priority: 1,
      nextAction: "面接想定質問を整理する",
      nextScheduledDate: date("2026-05-28"),
      memo: "プロダクト開発経験とAI活用経験を中心に準備する。",
    },
    {
      id: "company-002",
      name: "Blue Ladder Labs",
      websiteUrl: "https://example.com/blue-ladder-labs",
      industry: "Productivity Tool",
      position: "プロダクトエンジニア",
      status: ApplicationStatus.DOCUMENT_SCREENING,
      priority: 2,
      nextAction: "職務経歴書を送付する",
      nextScheduledDate: date("2026-05-30"),
      memo: "プロダクト改善の実績を冒頭に追記してから送る。",
    },
    {
      id: "company-003",
      name: "Green Field Works",
      websiteUrl: "https://example.com/green-field-works",
      industry: "Cloud Infrastructure",
      position: "バックエンドエンジニア",
      status: ApplicationStatus.NOT_APPLIED,
      priority: 2,
      nextAction: "求人票の必須要件を確認する",
      nextScheduledDate: date("2026-06-03"),
      memo: "Goとクラウド運用経験の要件を自分の実績に対応づける。",
    },
    {
      id: "company-004",
      name: "株式会社Craft Base",
      websiteUrl: "https://example.com/craft-base",
      industry: "Developer Platform",
      position: "フルスタックエンジニア",
      status: ApplicationStatus.FINAL_INTERVIEW,
      priority: 1,
      nextAction: "逆質問を3つ準備する",
      nextScheduledDate: date("2026-05-27"),
      memo: "最終面接向けに事業理解と入社後の貢献領域を整理する。",
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {
        ...company,
        userId: demoUser.id,
      },
      create: {
        ...company,
        userId: demoUser.id,
      },
    });
  }

  const tasks = [
    {
      id: "task-001",
      companyId: "company-001",
      title: "面接想定質問を整理する",
      dueDate: date("2026-05-26"),
      isCompleted: false,
      priority: 1,
      memo: "プロダクト開発経験とAI活用経験を中心に回答を準備する。",
    },
    {
      id: "task-002",
      companyId: "company-001",
      title: "企業ブログを確認する",
      dueDate: date("2026-05-27"),
      isCompleted: false,
      priority: 2,
      memo: "直近の技術記事から質問に使えそうな話題を拾う。",
    },
    {
      id: "task-003",
      companyId: "company-002",
      title: "職務経歴書を送付する",
      dueDate: date("2026-05-30"),
      isCompleted: false,
      priority: 1,
      memo: "プロダクト改善の実績を冒頭に追記してから送る。",
    },
    {
      id: "task-004",
      companyId: "company-003",
      title: "求人票の必須要件を確認する",
      dueDate: date("2026-06-03"),
      isCompleted: false,
      priority: 2,
      memo: "Goとクラウド運用経験の要件を自分の実績に対応づける。",
    },
    {
      id: "task-005",
      companyId: "company-004",
      title: "逆質問を3つ準備する",
      dueDate: date("2026-05-27"),
      isCompleted: false,
      priority: 1,
      memo: "チーム体制、評価制度、事業優先度を聞く。",
    },
    {
      id: "task-006",
      companyId: null,
      title: "職務経歴書の代表プロジェクトを見直す",
      dueDate: date("2026-05-31"),
      isCompleted: false,
      priority: 2,
      memo: "応募先に共通して使えるプロダクト改善実績を整理する。",
    },
    {
      id: "task-007",
      companyId: null,
      title: "ポートフォリオの説明文を更新する",
      dueDate: date("2026-06-02"),
      isCompleted: true,
      priority: 3,
      memo: "バックエンド設計と運用改善の説明を追加済み。",
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        ...task,
        userId: demoUser.id,
      },
      create: {
        ...task,
        userId: demoUser.id,
      },
    });
  }

  const interviewLogs = [
    {
      id: "interview-log-001",
      companyId: "company-001",
      interviewDate: date("2026-05-21"),
      interviewType: "カジュアル面談",
      questions:
        "これまでのフロントエンド開発で、特に成果が出た改善は何ですか。\nAIを使った開発支援をチームに導入するなら、どこから始めますか。",
      answerMemo:
        "既存画面の表示速度改善と、レビュー前チェックの自動化について説明した。",
      goodPoints:
        "実績を数字とユーザー影響に結びつけて説明できた。相手の開発体制に合わせて質問を返せた。",
      improvementPoints:
        "AI活用の失敗例やリスク管理について、もう少し具体例を添えられるとよかった。",
      nextPreparation:
        "一次面接に向けて、プロダクト改善の意思決定プロセスと技術選定理由を整理する。",
    },
    {
      id: "interview-log-002",
      companyId: "company-001",
      interviewDate: date("2026-05-24"),
      interviewType: "一次面接",
      questions:
        "複雑な状態管理をどのように整理しましたか。\n短い期間で品質を落とさずにリリースするために意識していることは何ですか。",
      answerMemo:
        "状態の責務を画面単位と共有データで分けた経験を説明した。",
      goodPoints: "設計判断の背景を、チーム運用と保守性の観点で話せた。",
      improvementPoints:
        "テスト戦略の説明が抽象的だったため、具体的なテスト種別と境界を補足したい。",
      nextPreparation:
        "次回はコードレビュー、障害対応、技術負債の扱いについて具体例を用意する。",
    },
    {
      id: "interview-log-003",
      companyId: "company-002",
      interviewDate: date("2026-05-20"),
      interviewType: "カジュアル面談",
      questions:
        "プロダクトエンジニアとして、企画段階から関わった経験はありますか。\nユーザー課題の優先度をどう判断しますか。",
      answerMemo:
        "問い合わせログと利用データを見ながら、影響人数と解決コストで優先順位をつけた経験を話した。",
      goodPoints: "ビジネス側との合意形成まで含めて説明できた。",
      improvementPoints: "技術的な実装詳細を聞かれたとき、少し説明が長くなった。",
      nextPreparation:
        "書類選考後の面接に備えて、職務経歴書の代表プロジェクトを3分で説明できるようにする。",
    },
    {
      id: "interview-log-004",
      companyId: "company-004",
      interviewDate: date("2026-05-18"),
      interviewType: "二次面接",
      questions:
        "フルスタックで担当するとき、どのレイヤーから設計を始めますか。\nチーム内で意見が割れたときにどう進めますか。",
      answerMemo:
        "ユーザー操作とデータの流れを先に揃え、API境界と画面責務を決める進め方を説明した。",
      goodPoints:
        "技術とコミュニケーションの両面で、再現性のある進め方を示せた。",
      improvementPoints:
        "最終面接に向けて、事業理解と入社後に貢献したい領域の解像度を上げたい。",
      nextPreparation:
        "逆質問では、半年後に期待される成果とチームの意思決定プロセスを確認する。",
    },
  ];

  for (const interviewLog of interviewLogs) {
    await prisma.interviewLog.upsert({
      where: { id: interviewLog.id },
      update: interviewLog,
      create: interviewLog,
    });
  }

  const [userCount, companyCount, taskCount, interviewLogCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.task.count(),
      prisma.interviewLog.count(),
    ]);

  console.log("Seed completed.");
  console.log(`User: ${userCount}`);
  console.log(`Company: ${companyCount}`);
  console.log(`Task: ${taskCount}`);
  console.log(`InterviewLog: ${interviewLogCount}`);
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
