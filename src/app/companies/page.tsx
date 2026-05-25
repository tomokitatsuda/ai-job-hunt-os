import Link from "next/link";
import { connection } from "next/server";

import type { ApplicationStatus } from "@/generated/prisma/client";

type CompanyPriority = "高" | "中" | "低";

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

const priorityStyles: Record<CompanyPriority, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const getPriorityLabel = (priority: number): CompanyPriority => {
  if (priority >= 4) {
    return "高";
  }

  if (priority === 3) {
    return "中";
  }

  return "低";
};

export default async function CompaniesPage() {
  await connection();

  const { prisma } = await import("@/lib/prisma");
  const companies = await prisma.company.findMany({
    where: {
      userId: demoUserId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          tasks: {
            where: {
              isCompleted: false,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500">AI Job Hunt OS</p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                企業一覧
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                応募中・応募予定の企業と、次に進めるべきアクションを確認できます。
              </p>
            </div>
            <div className="text-sm text-slate-500">
              登録企業数:{" "}
              <span className="font-semibold text-slate-900">
                {companies.length}
              </span>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
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
                    選考ステータス
                  </th>
                  <th scope="col" className="px-4 py-3">
                    志望度
                  </th>
                  <th scope="col" className="px-4 py-3">
                    次のアクション
                  </th>
                  <th scope="col" className="px-4 py-3">
                    次回予定日
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    未完了タスク数
                  </th>
                  <th scope="col" className="px-4 py-3">
                    最終更新日
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {companies.map((company) => {
                  const priority = getPriorityLabel(company.priority);

                  return (
                    <tr key={company.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-950">
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
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[priority]}`}
                        >
                          {priority}
                        </span>
                      </td>
                      <td className="min-w-56 px-4 py-4 text-slate-700">
                        {company.nextAction ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {formatDate(company.nextScheduledDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-950">
                        {company._count.tasks}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {formatDate(company.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
