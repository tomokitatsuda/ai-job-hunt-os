import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import type { ApplicationStatus } from "@/generated/prisma/client";

type PriorityLabel = "高" | "中" | "低";

const demoUserId = "demo-user";

const statusLabels: Record<ApplicationStatus, string> = {
  NOT_APPLIED: "応募準備",
  APPLIED: "応募済み",
  DOCUMENT_SCREENING: "書類選考",
  DOCUMENT_PASSED: "書類通過",
  FIRST_INTERVIEW: "一次面接",
  SECOND_INTERVIEW: "二次面接",
  FINAL_INTERVIEW: "最終面接",
  OFFER: "内定",
  REJECTED: "不採用",
  WITHDRAWN: "辞退",
};

const priorityStyles: Record<PriorityLabel, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

const taskPriorityStyles: Record<PriorityLabel, string> = priorityStyles;

const statusStyles = "bg-sky-50 text-sky-700 ring-sky-200";

const taskStatusStyles = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  incomplete: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const formatText = (value: string | null) => value ?? "-";

const getPriorityLabel = (priority: number): PriorityLabel => {
  if (priority >= 4) {
    return "高";
  }

  if (priority === 3) {
    return "中";
  }

  return "低";
};

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;

  await connection();

  const { prisma } = await import("@/lib/prisma");
  const company = await prisma.company.findFirst({
    where: {
      id,
      userId: demoUserId,
    },
    select: {
      id: true,
      name: true,
      position: true,
      status: true,
      priority: true,
      nextAction: true,
      nextScheduledDate: true,
      updatedAt: true,
      tasks: {
        where: {
          userId: demoUserId,
        },
        orderBy: [
          {
            isCompleted: "asc",
          },
          {
            dueDate: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          dueDate: true,
          isCompleted: true,
          priority: true,
          memo: true,
        },
      },
      interviewLogs: {
        orderBy: {
          interviewDate: "desc",
        },
        select: {
          id: true,
          interviewDate: true,
          interviewType: true,
          questions: true,
          answerMemo: true,
          goodPoints: true,
          improvementPoints: true,
          nextPreparation: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  async function deleteCompany() {
    "use server";

    const { prisma } = await import("@/lib/prisma");
    const companyToDelete = await prisma.company.findFirst({
      where: {
        id,
        userId: demoUserId,
      },
      select: {
        id: true,
      },
    });

    if (!companyToDelete) {
      notFound();
    }

    await prisma.$transaction([
      prisma.interviewLog.deleteMany({
        where: {
          companyId: id,
        },
      }),
      prisma.task.updateMany({
        where: {
          companyId: id,
          userId: demoUserId,
        },
        data: {
          companyId: null,
        },
      }),
      prisma.company.delete({
        where: {
          id,
        },
      }),
    ]);

    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    redirect("/companies");
  }

  const relatedTasks = company.tasks;
  const interviewLogs = company.interviewLogs;
  const incompleteTaskCount = relatedTasks.filter(
    (task) => !task.isCompleted,
  ).length;
  const companyPriority = getPriorityLabel(company.priority);

  const summaryItems = [
    ["応募ポジション", formatText(company.position)],
    ["次のアクション", formatText(company.nextAction)],
    ["次回予定日", formatDate(company.nextScheduledDate)],
    ["未完了タスク数", `${incompleteTaskCount}件`],
    ["最終更新日", formatDate(company.updatedAt)],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/companies"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            企業一覧へ戻る
          </Link>
          <Link
            href={`/companies/${company.id}/edit`}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            編集
          </Link>
        </div>

        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">企業詳細</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {company.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formatText(company.position)} の選考状況と次に進めるアクションを確認できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles}`}
              >
                {statusLabels[company.status]}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[companyPriority]}`}
              >
                志望度: {companyPriority}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {summaryItems.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <dt className="text-sm font-medium text-slate-500">{label}</dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {value}
              </dd>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                関連タスク
              </h2>
              <span className="text-sm text-slate-500">
                未完了 {incompleteTaskCount}件
              </span>
            </div>
            {relatedTasks.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {relatedTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {task.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {formatText(task.memo)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${task.isCompleted ? taskStatusStyles.completed : taskStatusStyles.incomplete}`}
                        >
                          {task.isCompleted ? "完了" : "未完了"}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${taskPriorityStyles[getPriorityLabel(task.priority)]}`}
                        >
                          優先度: {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">期限</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatDate(task.dueDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">完了状態</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {task.isCompleted ? "完了" : "未完了"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  関連タスクはまだありません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  この企業に紐づくタスクが追加されると、ここに表示されます。
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                面接ログ
              </h2>
              <span className="text-sm text-slate-500">
                {interviewLogs.length}件
              </span>
            </div>
            {interviewLogs.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {interviewLogs.map((interviewLog) => (
                  <article
                    key={interviewLog.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {formatDate(interviewLog.interviewDate)}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {formatText(interviewLog.questions)
                            .split("\n")
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                        {formatText(interviewLog.interviewType)}
                      </span>
                    </div>
                    <dl className="mt-4 flex flex-col gap-3 text-sm">
                      <div>
                        <dt className="text-slate-500">自分の回答メモ</dt>
                        <dd className="mt-1 leading-6 text-slate-900">
                          {formatText(interviewLog.answerMemo)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">良かった点</dt>
                        <dd className="mt-1 leading-6 text-slate-900">
                          {formatText(interviewLog.goodPoints)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">改善点</dt>
                        <dd className="mt-1 leading-6 text-slate-900">
                          {formatText(interviewLog.improvementPoints)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">次回に向けた対策</dt>
                        <dd className="mt-1 leading-6 text-slate-900">
                          {formatText(interviewLog.nextPreparation)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  まだ面接ログはありません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  この企業の面接を振り返った内容が追加されると、ここに表示されます。
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-rose-950">
                企業を削除
              </h2>
              <p className="mt-2 text-sm leading-6 text-rose-700">
                削除すると元に戻せません。面接ログは削除され、関連タスクは一般タスクとして残ります。
              </p>
            </div>
            <form action={deleteCompany}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 sm:w-auto"
              >
                企業を削除
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
