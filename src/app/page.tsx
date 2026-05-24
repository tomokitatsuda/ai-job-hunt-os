import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm font-medium text-slate-500">AI Job Hunt OS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          就職活動の企業情報を一元管理する
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          v1.0 MVP では、応募先企業のステータス、志望度、次のアクションを一覧で確認できます。
        </p>
        <div className="mt-8">
          <Link
            href="/companies"
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            企業一覧を開く
          </Link>
        </div>
      </div>
    </main>
  );
}
