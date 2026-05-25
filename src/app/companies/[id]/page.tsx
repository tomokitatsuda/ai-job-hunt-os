import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CompanySummary } from "./_components/company-summary";
import { DeleteCompanySection } from "./_components/delete-company-section";
import { InterviewLogSection } from "./_components/interview-log-section";
import { TaskSection } from "./_components/task-section";

const demoUserId = "demo-user";

const formatDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "-";

const formatText = (value: string | null) => value ?? "-";

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;

  await connection();

  const { prisma } = await import("@/lib/prisma");
  const company = await prisma.company.findFirst({
    where: {
      id,
      userId: demoUserId,
    },
    select: {
      id: true,
      name: true,
      position: true,
      status: true,
      priority: true,
      nextAction: true,
      nextScheduledDate: true,
      updatedAt: true,
      tasks: {
        where: {
          userId: demoUserId,
        },
        orderBy: [
          {
            isCompleted: "asc",
          },
          {
            dueDate: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          dueDate: true,
          isCompleted: true,
          priority: true,
          memo: true,
        },
      },
      interviewLogs: {
        orderBy: {
          interviewDate: "desc",
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
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const relatedTasks = company.tasks;
  const interviewLogs = company.interviewLogs;
  const incompleteTaskCount = relatedTasks.filter(
    (task) => !task.isCompleted,
  ).length;

  const summaryItems = [
    {
      label: "応募ポジション",
      value: formatText(company.position),
    },
    {
      label: "次のアクション",
      value: formatText(company.nextAction),
    },
    {
      label: "次回予定日",
      value: formatDate(company.nextScheduledDate),
    },
    {
      label: "未完了タスク数",
      value: `${incompleteTaskCount}件`,
    },
    {
      label: "最終更新日",
      value: formatDate(company.updatedAt),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/companies"
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            企業一覧へ戻る
          </Link>
          <Link
            href={`/companies/${company.id}/edit`}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            編集
          </Link>
        </div>

        <CompanySummary company={company} summaryItems={summaryItems} />

        <section className="grid gap-4 lg:grid-cols-2">
          <TaskSection
            companyId={company.id}
            incompleteTaskCount={incompleteTaskCount}
            tasks={relatedTasks}
          />
          <InterviewLogSection
            companyId={company.id}
            interviewLogs={interviewLogs}
          />
        </section>

        <DeleteCompanySection companyId={company.id} />
      </div>
    </main>
  );
}
