import Link from "next/link";
import { connection } from "next/server";

import { createGeneralTask, toggleTaskCompletionFromTaskList } from "./actions";

const demoUserId = "demo-user";

const taskStatusStyles = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  incomplete: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const formatText = (value: string | null) => value ?? "-";

type TaskListItem = {
  id: string;
  title: string;
  memo: string | null;
  dueDate: Date | null;
  isCompleted: boolean;
  company: {
    id: string;
    name: string;
  } | null;
};

type TaskListSectionProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  tasks: TaskListItem[];
};

function TaskListSection({
  title,
  emptyTitle,
  emptyDescription,
  tasks,
}: TaskListSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <span className="text-sm text-slate-500">{tasks.length}件</span>
      </div>
      {tasks.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {tasks.map((task) => (
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
                <span
                  className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    task.isCompleted
                      ? taskStatusStyles.completed
                      : taskStatusStyles.incomplete
                  }`}
                >
                  {task.isCompleted ? "完了" : "未完了"}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
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
                <div>
                  <dt className="text-slate-500">関連Company</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {task.company ? (
                      <Link
                        href={`/companies/${task.company.id}`}
                        className="underline-offset-4 hover:text-slate-700 hover:underline"
                      >
                        {task.company.name}
                      </Link>
                    ) : (
                      "関連企業なし"
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={toggleTaskCompletionFromTaskList}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                  >
                    {task.isCompleted ? "未完了に戻す" : "完了にする"}
                  </button>
                </form>
                {task.company ? (
                  <Link
                    href={`/companies/${task.company.id}`}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                  >
                    Company詳細
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">{emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}

export default async function TasksPage() {
  await connection();

  const { prisma } = await import("@/lib/prisma");
  const tasks = await prisma.task.findMany({
    where: {
      userId: demoUserId,
    },
    orderBy: [
      {
        dueDate: {
          sort: "asc",
          nulls: "last",
        },
      },
      {
        updatedAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      memo: true,
      dueDate: true,
      isCompleted: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const incompleteTasks = tasks.filter((task) => !task.isCompleted);
  const completedTasks = tasks.filter((task) => task.isCompleted);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500">AI Job Hunt OS</p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Task一覧
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Companyに紐づくTaskと一般Taskを横断して確認できます。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                ダッシュボードへ戻る
              </Link>
              <div className="text-sm text-slate-500">
                登録Task数:{" "}
                <span className="font-semibold text-slate-900">
                  {tasks.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-950">
              一般タスクを追加
            </h2>
          </div>
          <form
            action={createGeneralTask}
            className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  タスク名 <span className="text-rose-600">*</span>
                </span>
                <input
                  name="title"
                  required
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">期限</span>
                <input
                  name="dueDate"
                  type="date"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">メモ</span>
                <textarea
                  name="memo"
                  rows={3}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                一般タスクを追加
              </button>
            </div>
          </form>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <TaskListSection
            title="未完了Task"
            emptyTitle="未完了Taskはありません"
            emptyDescription="一般TaskまたはCompany詳細のTaskを追加すると、ここに表示されます。"
            tasks={incompleteTasks}
          />
          <TaskListSection
            title="完了Task"
            emptyTitle="完了Taskはありません"
            emptyDescription="完了にしたTaskがここに表示されます。"
            tasks={completedTasks}
          />
        </div>
      </div>
    </main>
  );
}
