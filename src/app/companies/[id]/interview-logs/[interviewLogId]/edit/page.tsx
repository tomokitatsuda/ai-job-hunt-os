import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { updateInterviewLog } from "../../../actions";
import { getCurrentUserId } from "@/lib/current-user";

const formatDateInputValue = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

type EditInterviewLogPageProps = {
  params: Promise<{ id: string; interviewLogId: string }>;
};

export default async function EditInterviewLogPage({
  params,
}: EditInterviewLogPageProps) {
  const { id, interviewLogId } = await params;

  await connection();

  const { prisma } = await import("@/lib/prisma");
  const currentUserId = await getCurrentUserId();
  const interviewLog = await prisma.interviewLog.findFirst({
    where: {
      id: interviewLogId,
      companyId: id,
      company: {
        userId: currentUserId,
      },
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
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!interviewLog) {
    notFound();
  }

  const updateInterviewLogForCompany = updateInterviewLog.bind(
    null,
    id,
    interviewLog.id,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Link
            href={`/companies/${interviewLog.company.id}`}
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            企業詳細へ戻る
          </Link>
        </div>

        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">面接ログ編集</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            面接ログを編集
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {interviewLog.company.name} に紐づく面接ログを更新します。
          </p>
          <p className="mt-1 text-sm text-slate-500">
            面接日: {formatDateInputValue(interviewLog.interviewDate) || "未設定"}
            {interviewLog.interviewType ? ` / ${interviewLog.interviewType}` : ""}
        </p>
        </header>

        <form
          action={updateInterviewLogForCompany}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                面接日
              </span>
              <input
                name="interviewDate"
                type="date"
                defaultValue={formatDateInputValue(
                  interviewLog.interviewDate,
                )}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                面接種別
              </span>
              <input
                name="interviewType"
                defaultValue={interviewLog.interviewType ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                質問された内容
              </span>
              <textarea
                name="questions"
                rows={4}
                defaultValue={interviewLog.questions ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                自分の回答メモ
              </span>
              <textarea
                name="answerMemo"
                rows={4}
                defaultValue={interviewLog.answerMemo ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                良かった点
              </span>
              <textarea
                name="goodPoints"
                rows={4}
                defaultValue={interviewLog.goodPoints ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                改善点
              </span>
              <textarea
                name="improvementPoints"
                rows={4}
                defaultValue={interviewLog.improvementPoints ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                次回に向けた対策
              </span>
              <textarea
                name="nextPreparation"
                rows={4}
                defaultValue={interviewLog.nextPreparation ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={`/companies/${interviewLog.company.id}`}
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
