import Link from "next/link";

import { createInterviewLog, deleteInterviewLog } from "../actions";

type InterviewLog = {
  id: string;
  interviewDate: Date | null;
  interviewType: string | null;
  questions: string | null;
  answerMemo: string | null;
  goodPoints: string | null;
  improvementPoints: string | null;
  nextPreparation: string | null;
};

type InterviewLogSectionProps = {
  companyId: string;
  interviewLogs: InterviewLog[];
};

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const formatText = (value: string | null) => value ?? "-";

export function InterviewLogSection({
  companyId,
  interviewLogs,
}: InterviewLogSectionProps) {
  const createInterviewLogForCompany = createInterviewLog.bind(
    null,
    companyId,
  );
  const deleteInterviewLogForCompany = deleteInterviewLog.bind(
    null,
    companyId,
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">面接ログ</h2>
        <span className="text-sm text-slate-500">
          {interviewLogs.length}件
        </span>
      </div>
      <form
        action={createInterviewLogForCompany}
        className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">面接日</span>
            <input
              name="interviewDate"
              type="date"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              面接種別
            </span>
            <input
              name="interviewType"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              質問された内容
            </span>
            <textarea
              name="questions"
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              自分の回答メモ
            </span>
            <textarea
              name="answerMemo"
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              良かった点
            </span>
            <textarea
              name="goodPoints"
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">改善点</span>
            <textarea
              name="improvementPoints"
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              次回に向けた対策
            </span>
            <textarea
              name="nextPreparation"
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
            面接ログを追加
          </button>
        </div>
      </form>
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/companies/${companyId}/interview-logs/${interviewLog.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
                >
                  編集
                </Link>
                <form action={deleteInterviewLogForCompany}>
                  <input
                    type="hidden"
                    name="interviewLogId"
                    value={interviewLog.id}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                  >
                    削除
                  </button>
                </form>
              </div>
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
  );
}
