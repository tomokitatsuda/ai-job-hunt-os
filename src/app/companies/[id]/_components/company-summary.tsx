import type { ApplicationStatus } from "@/generated/prisma/client";

type PriorityLabel = "高" | "中" | "低";

type SummaryItem = {
  label: string;
  value: string;
};

type CompanySummaryProps = {
  company: {
    name: string;
    position: string | null;
    status: ApplicationStatus;
    priority: number;
  };
  summaryItems: SummaryItem[];
};

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

const priorityStyles: Record<PriorityLabel, string> = {
  高: "bg-rose-50 text-rose-700 ring-rose-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusStyles = "bg-sky-50 text-sky-700 ring-sky-200";

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

export function CompanySummary({ company, summaryItems }: CompanySummaryProps) {
  const companyPriority = getPriorityLabel(company.priority);

  return (
    <>
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">企業詳細</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {company.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {formatText(company.position)} の選考状況と次に進めるアクションを確認できます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles}`}
            >
              {statusLabels[company.status]}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[companyPriority]}`}
            >
              志望度: {companyPriority}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <dt className="text-sm font-medium text-slate-500">
              {item.label}
            </dt>
            <dd className="mt-2 text-base font-semibold text-slate-950">
              {item.value}
            </dd>
          </div>
        ))}
      </section>
    </>
  );
}
