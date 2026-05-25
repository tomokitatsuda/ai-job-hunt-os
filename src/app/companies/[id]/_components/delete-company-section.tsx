import { deleteCompany } from "../actions";

type DeleteCompanySectionProps = {
  companyId: string;
};

export function DeleteCompanySection({
  companyId,
}: DeleteCompanySectionProps) {
  const deleteCompanyById = deleteCompany.bind(null, companyId);

  return (
    <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-rose-950">企業を削除</h2>
          <p className="mt-2 text-sm leading-6 text-rose-700">
            削除すると元に戻せません。面接ログは削除され、関連タスクは一般タスクとして残ります。
          </p>
        </div>
        <form action={deleteCompanyById}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 sm:w-auto"
          >
            企業を削除
          </button>
        </form>
      </div>
    </section>
  );
}
