import Link from "next/link";
import { connection } from "next/server";

import { ApplicationStatus } from "@/generated/prisma/client";
import { SignOutButton } from "@/app/_components/auth-actions";
import { getCurrentUserId } from "@/lib/current-user";

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

const statusOrder: ApplicationStatus[] = [
  ApplicationStatus.NOT_APPLIED,
  ApplicationStatus.APPLIED,
  ApplicationStatus.DOCUMENT_SCREENING,
  ApplicationStatus.DOCUMENT_PASSED,
  ApplicationStatus.FIRST_INTERVIEW,
  ApplicationStatus.SECOND_INTERVIEW,
  ApplicationStatus.FINAL_INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const getPriorityLabel = (priority: number) => {
  if (priority >= 4) {
    return "高";
  }

  if (priority === 3) {
    return "中";
  }

  return "低";
};

export default async function Home() {
  await connection();

  const { prisma } = await import("@/lib/prisma");
  const currentUserId = await getCurrentUserId();

  const [
    totalCompanies,
    statusCounts,
    incompleteTaskCount,
    upcomingTasks,
    upcomingInterviewLogs,
    topPriorityCompanies,
  ] = await Promise.all([
    prisma.company.count({
      where: {
        userId: currentUserId,
      },
    }),
    prisma.company.groupBy({
      by: ["status"],
      where: {
        userId: currentUserId,
      },
      _count: {
        status: true,
      },
    }),
    prisma.task.count({
      where: {
        userId: currentUserId,
        isCompleted: false,
        OR: [
          {
            companyId: null,
          },
          {
            company: {
              userId: currentUserId,
            },
          },
        ],
      },
    }),
    prisma.task.findMany({
      where: {
        userId: currentUserId,
        isCompleted: false,
        OR: [
          {
            companyId: null,
          },
          {
            company: {
              userId: currentUserId,
            },
          },
        ],
        dueDate: {
          not: null,
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        dueDate: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.interviewLog.findMany({
      where: {
        interviewDate: {
          not: null,
        },
        company: {
          userId: currentUserId,
        },
      },
      orderBy: {
        interviewDate: "asc",
      },
      take: 5,
      select: {
        id: true,
        interviewDate: true,
        interviewType: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.company.findMany({
      where: {
        userId: currentUserId,
      },
      orderBy: [
        {
          priority: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        position: true,
        priority: true,
        status: true,
      },
    }),
  ]);

  const statusCountMap = new Map(
    statusCounts.map((item) => [item.status, item._count.status]),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500">AI Job Hunt OS</p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                応募企業、未完了タスク、面接予定をまとめて確認できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/companies"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
              >
                企業を見る
              </Link>
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
              >
                タスクを見る
              </Link>
              <Link
                href="/companies/new"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                企業を追加
              </Link>
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                タスクを追加
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">応募企業数</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {totalCompanies}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              未完了Task数
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {incompleteTaskCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              直近のTask締切
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {formatDate(upcomingTasks[0]?.dueDate ?? null)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              直近の面接日
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {formatDate(upcomingInterviewLogs[0]?.interviewDate ?? null)}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              選考ステータス別
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {statusOrder.map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-600">{statusLabels[status]}</span>
                  <span className="font-semibold text-slate-950">
                    {statusCountMap.get(status) ?? 0}件
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                志望度の高いCompany
              </h2>
              <span className="text-sm text-slate-500">
                最大 {topPriorityCompanies.length}件
              </span>
            </div>
            {topPriorityCompanies.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        企業名
                      </th>
                      <th scope="col" className="px-4 py-3">
                        応募ポジション
                      </th>
                      <th scope="col" className="px-4 py-3">
                        ステータス
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        志望度
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {topPriorityCompanies.map((company) => (
                      <tr key={company.id}>
                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          <Link
                            href={`/companies/${company.id}`}
                            className="text-slate-950 underline-offset-4 hover:text-slate-700 hover:underline"
                          >
                            {company.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                          {company.position ?? "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                          {statusLabels[company.status]}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-950">
                          {company.priority} / {getPriorityLabel(company.priority)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  まだ企業は登録されていません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  企業を追加すると、志望度の高い順にここへ表示されます。
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                直近のTask締切
              </h2>
              <span className="text-sm text-slate-500">
                最大 {upcomingTasks.length}件
              </span>
            </div>
            {upcomingTasks.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {upcomingTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {task.company ? (
                            <Link
                              href={`/companies/${task.company.id}`}
                              className="underline-offset-4 hover:text-slate-950 hover:underline"
                            >
                              {task.company.name}
                            </Link>
                          ) : (
                            "一般タスク（関連企業なし）"
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  締切付きの未完了Taskはありません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Taskに期限を設定すると、締切が近い順に表示されます。
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">
                直近の面接予定・InterviewLog
              </h2>
              <span className="text-sm text-slate-500">
                最大 {upcomingInterviewLogs.length}件
              </span>
            </div>
            {upcomingInterviewLogs.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {upcomingInterviewLogs.map((interviewLog) => (
                  <article
                    key={interviewLog.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          <Link
                            href={`/companies/${interviewLog.company.id}`}
                            className="underline-offset-4 hover:text-slate-700 hover:underline"
                          >
                            {interviewLog.company.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {interviewLog.interviewType ?? "面接種別未設定"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {formatDate(interviewLog.interviewDate)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  日付付きのInterviewLogはありません
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  面接ログに日付を設定すると、日付順にここへ表示されます。
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
