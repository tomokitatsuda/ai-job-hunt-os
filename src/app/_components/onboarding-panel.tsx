import Link from "next/link";

import { createStarterData } from "@/app/actions";
import { StarterDataSubmitButton } from "@/app/_components/starter-data-submit-button";

const onboardingSteps = [
  {
    title: "応募先を登録",
    description: "Companyに企業名、ポジション、選考状況を記録します。",
  },
  {
    title: "次の行動をTask化",
    description: "応募期限や面接準備など、次にやることを整理します。",
  },
  {
    title: "選考後に振り返る",
    description: "面接が始まったらCompany詳細にInterviewLogを残します。",
  },
];

export function OnboardingPanel() {
  return (
    <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-indigo-700">
            はじめてのセットアップ
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            最初のデータを用意しましょう
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            実際の応募先を1社登録するか、編集可能なスターターデータで画面の使い方を確認できます。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/companies/new"
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            最初の企業を登録
          </Link>
          <form action={createStarterData}>
            <StarterDataSubmitButton />
          </form>
        </div>
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {onboardingSteps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-md border border-indigo-100 bg-white/80 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs leading-5 text-indigo-800">
        スターターデータは、サンプルCompany 1件、Company紐づきTask
        1件、一般Task 1件です。すべて後から編集・削除できます。
      </p>
    </section>
  );
}
