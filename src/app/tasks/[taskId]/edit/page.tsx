import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateTaskFromTaskList } from "../../actions";
import { getCurrentUserId } from "@/lib/current-user";

const formatDateInputValue = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

type EditTaskPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { taskId } = await params;

  await connection();

  const { prisma } = await import("@/lib/prisma");
  const currentUserId = await getCurrentUserId();
  const [task, companies] = await Promise.all([
    prisma.task.findFirst({
      where: {
        id: taskId,
        userId: currentUserId,
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
      select: {
        id: true,
        title: true,
        dueDate: true,
        memo: true,
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
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!task) {
    notFound();
  }

  const updateTask = updateTaskFromTaskList.bind(null, task.id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Link
            href="/tasks"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            Task一覧へ戻る
          </Link>
        </div>

        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">タスク編集</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {task.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {task.company
              ? `${task.company.name} に紐づくタスク内容と関連企業を更新します。`
              : "一般タスクの内容を更新し、必要に応じて企業へ紐づけます。"}
          </p>
        </header>

        <form
          action={updateTask}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                タスク名 <span className="text-rose-600">*</span>
              </span>
              <input
                name="title"
                required
                defaultValue={task.title}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">期限</span>
              <input
                name="dueDate"
                type="date"
                defaultValue={formatDateInputValue(task.dueDate)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                関連企業
              </span>
              <select
                name="companyId"
                defaultValue={task.company?.id ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">関連企業なし（一般タスク）</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">メモ</span>
              <textarea
                name="memo"
                rows={5}
                defaultValue={task.memo ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              変更を保存
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
