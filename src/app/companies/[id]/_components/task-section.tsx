import Link from "next/link";

import { createTask, deleteTask, toggleTaskCompletion } from "../actions";

type PriorityLabel = "高" | "中" | "低";

type Task = {
  id: string;
  title: string;
  dueDate: Date | null;
  isCompleted: boolean;
  priority: number;
  memo: string | null;
};

type TaskSectionProps = {
  companyId: string;
  incompleteTaskCount: number;
  tasks: Task[];
};

const taskPriorityStyles: Record<PriorityLabel, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

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

export function TaskSection({
  companyId,
  incompleteTaskCount,
  tasks,
}: TaskSectionProps) {
  const createTaskForCompany = createTask.bind(null, companyId);
  const toggleTaskCompletionForCompany = toggleTaskCompletion.bind(
    null,
    companyId,
  );
  const deleteTaskForCompany = deleteTask.bind(null, companyId);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">関連タスク</h2>
        <span className="text-sm text-slate-500">
          未完了 {incompleteTaskCount}件
        </span>
      </div>
      <form
        action={createTaskForCompany}
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
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">優先度</span>
            <input
              name="priority"
              type="number"
              min="1"
              max="5"
              defaultValue={3}
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
            タスクを追加
          </button>
        </div>
      </form>
      {tasks.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {tasks.map((task) => {
            const priorityLabel = getPriorityLabel(task.priority);

            return (
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
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${taskPriorityStyles[priorityLabel]}`}
                    >
                      優先度: {priorityLabel}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={toggleTaskCompletionForCompany}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                    >
                      {task.isCompleted ? "未完了に戻す" : "完了にする"}
                    </button>
                  </form>
                  <Link
                    href={`/companies/${companyId}/tasks/${task.id}/edit`}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                  >
                    編集
                  </Link>
                  <form action={deleteTaskForCompany}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
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
  );
}
