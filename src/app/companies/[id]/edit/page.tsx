import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { ApplicationStatus } from "@/generated/prisma/client";

const demoUserId = "demo-user";

const statusOptions = [
  { value: ApplicationStatus.NOT_APPLIED, label: "未応募" },
  { value: ApplicationStatus.APPLIED, label: "応募済み" },
  { value: ApplicationStatus.DOCUMENT_SCREENING, label: "書類選考中" },
  { value: ApplicationStatus.DOCUMENT_PASSED, label: "書類通過" },
  { value: ApplicationStatus.FIRST_INTERVIEW, label: "一次面接" },
  { value: ApplicationStatus.SECOND_INTERVIEW, label: "二次面接" },
  { value: ApplicationStatus.FINAL_INTERVIEW, label: "最終面接" },
  { value: ApplicationStatus.OFFER, label: "内定" },
  { value: ApplicationStatus.REJECTED, label: "不合格" },
  { value: ApplicationStatus.WITHDRAWN, label: "辞退" },
];

const toNullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const parsePriority = (value: FormDataEntryValue | null) => {
  const priority = Number(toNullableString(value));

  if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
    return 3;
  }

  return priority;
};

const parseNextScheduledDate = (value: FormDataEntryValue | null) => {
  const dateText = toNullableString(value);

  if (!dateText) {
    return null;
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseStatus = (value: FormDataEntryValue | null) => {
  if (typeof value === "string") {
    const statusOption = statusOptions.find((option) => option.value === value);

    if (statusOption) {
      return statusOption.value;
    }
  }

  return ApplicationStatus.NOT_APPLIED;
};

const formatDateInputValue = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

type EditCompanyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
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
      websiteUrl: true,
      industry: true,
      position: true,
      status: true,
      priority: true,
      nextAction: true,
      nextScheduledDate: true,
      memo: true,
    },
  });

  if (!company) {
    notFound();
  }

  async function updateCompany(formData: FormData) {
    "use server";

    const name = toNullableString(formData.get("name"));

    if (!name) {
      return;
    }

    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.company.updateMany({
      where: {
        id,
        userId: demoUserId,
      },
      data: {
        name,
        websiteUrl: toNullableString(formData.get("websiteUrl")),
        industry: toNullableString(formData.get("industry")),
        position: toNullableString(formData.get("position")),
        status: parseStatus(formData.get("status")),
        priority: parsePriority(formData.get("priority")),
        nextAction: toNullableString(formData.get("nextAction")),
        nextScheduledDate: parseNextScheduledDate(
          formData.get("nextScheduledDate"),
        ),
        memo: toNullableString(formData.get("memo")),
      },
    });

    if (result.count === 0) {
      notFound();
    }

    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    redirect(`/companies/${id}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <Link
            href={`/companies/${company.id}`}
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
          >
            企業詳細へ戻る
          </Link>
        </div>

        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">企業編集</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {company.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            登録済みの企業情報と次に進めるアクションを更新します。
          </p>
        </header>

        <form
          action={updateCompany}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                企業名 <span className="text-rose-600">*</span>
              </span>
              <input
                name="name"
                required
                defaultValue={company.name}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                企業URL
              </span>
              <input
                name="websiteUrl"
                type="url"
                defaultValue={company.websiteUrl ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">業界</span>
              <input
                name="industry"
                defaultValue={company.industry ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                応募ポジション
              </span>
              <input
                name="position"
                defaultValue={company.position ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                選考ステータス
              </span>
              <select
                name="status"
                defaultValue={company.status}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                志望度
              </span>
              <input
                name="priority"
                type="number"
                min="1"
                max="5"
                defaultValue={company.priority}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                次のアクション
              </span>
              <input
                name="nextAction"
                defaultValue={company.nextAction ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                次回予定日
              </span>
              <input
                name="nextScheduledDate"
                type="date"
                defaultValue={formatDateInputValue(company.nextScheduledDate)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">メモ</span>
              <textarea
                name="memo"
                rows={5}
                defaultValue={company.memo ?? ""}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={`/companies/${company.id}`}
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
