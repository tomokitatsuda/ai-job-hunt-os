import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCompanyById,
  type CompanyPriority,
} from "@/lib/mock-companies";
import {
  getIncompleteTaskCountByCompanyId,
  getTasksByCompanyId,
  type TaskPriority,
} from "@/lib/mock-tasks";

const priorityStyles: Record<CompanyPriority, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

const taskPriorityStyles: Record<TaskPriority, string> = priorityStyles;

const statusStyles = "bg-sky-50 text-sky-700 ring-sky-200";

const taskStatusStyles = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  incomplete: "bg-slate-100 text-slate-700 ring-slate-200",
};

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;
  const company = getCompanyById(id);

  if (!company) {
    notFound();
  }

  const relatedTasks = getTasksByCompanyId(company.id);
  const incompleteTaskCount = getIncompleteTaskCountByCompanyId(company.id);

  const summaryItems = [
    ["応募ポジション", company.position],
    ["次のアクション", company.nextAction],
    ["次回予定日", company.nextScheduledDate],
    ["未完了タスク数", `${incompleteTaskCount}件`],
    ["最終更新日", company.updatedAt],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <Link
            href="/companies"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            企業一覧へ戻る
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
                {company.position} の選考状況と次に進めるアクションを確認できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles}`}
              >
                {company.status}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[company.priority]}`}
              >
                志望度: {company.priority}
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
                          {task.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {task.memo}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${task.isCompleted ? taskStatusStyles.completed : taskStatusStyles.incomplete}`}
                        >
                          {task.isCompleted ? "完了" : "未完了"}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${taskPriorityStyles[task.priority]}`}
                        >
                          優先度: {task.priority}
                        </span>
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">期限</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {task.dueDate}
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
            <h2 className="text-base font-semibold text-slate-950">
              面接ログ
            </h2>
            <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">
                まだ面接ログはありません
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                InterviewLog モデルと紐づける予定の空状態です。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
