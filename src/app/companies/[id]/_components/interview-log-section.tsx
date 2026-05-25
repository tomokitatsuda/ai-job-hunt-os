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
  interviewLogs: InterviewLog[];
};

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const formatText = (value: string | null) => value ?? "-";

export function InterviewLogSection({
  interviewLogs,
}: InterviewLogSectionProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">面接ログ</h2>
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
  );
}
