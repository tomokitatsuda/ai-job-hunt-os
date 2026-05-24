import Link from "next/link";

import { companies, type CompanyPriority } from "@/lib/mock-companies";
import { getIncompleteTaskCountByCompanyId } from "@/lib/mock-tasks";

const priorityStyles: Record<CompanyPriority, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function CompaniesPage() {
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
                {companies.map((company) => (
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
                      {company.position}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                      {company.status}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[company.priority]}`}
                      >
                        {company.priority}
                      </span>
                    </td>
                    <td className="min-w-56 px-4 py-4 text-slate-700">
                      {company.nextAction}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                      {company.nextScheduledDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-950">
                      {getIncompleteTaskCountByCompanyId(company.id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                      {company.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
