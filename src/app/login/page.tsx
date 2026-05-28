import Link from "next/link";

import { GitHubSignInButton } from "@/app/_components/auth-actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-500">AI Job Hunt OS</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            ログイン
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            GitHubアカウントでログインします。
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <GitHubSignInButton />
        </section>

        <Link
          href="/"
          className="text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline"
        >
          Dashboardへ戻る
        </Link>
      </div>
    </main>
  );
}
