"use client";

import { useFormStatus } from "react-dom";

export function StarterDataSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 shadow-sm hover:bg-indigo-100 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "作成しています..." : "スターターデータを作成"}
    </button>
  );
}
