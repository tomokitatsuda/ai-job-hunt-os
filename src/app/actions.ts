"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApplicationStatus, Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/current-user";

const starterDataTransactionRetries = 3;

export async function createStarterData() {
  const { prisma } = await import("@/lib/prisma");
  const currentUserId = await getCurrentUserId();

  let starterCompanyId: string | null = null;

  for (let attempt = 1; attempt <= starterDataTransactionRetries; attempt += 1) {
    try {
      starterCompanyId = await prisma.$transaction(
        async (transaction) => {
          const companyCount = await transaction.company.count({
            where: {
              userId: currentUserId,
            },
          });
          const taskCount = await transaction.task.count({
            where: {
              userId: currentUserId,
            },
          });

          if (companyCount > 0 || taskCount > 0) {
            return null;
          }

          const company = await transaction.company.create({
            data: {
              userId: currentUserId,
              name: "サンプル企業（編集してください）",
              position: "ソフトウェアエンジニア",
              status: ApplicationStatus.NOT_APPLIED,
              priority: 3,
              nextAction: "企業情報を実際の応募先に更新する",
              memo: "オンボーディングで作成されたサンプルです。不要なら削除できます。",
            },
            select: {
              id: true,
            },
          });

          await transaction.task.createMany({
            data: [
              {
                userId: currentUserId,
                companyId: company.id,
                title: "募集要項と応募期限を確認する",
                priority: 3,
                memo: "関連企業が設定されたTaskのサンプルです。",
              },
              {
                userId: currentUserId,
                companyId: null,
                title: "職務経歴書・履歴書を更新する",
                priority: 3,
                memo: "企業に紐づかない一般Taskのサンプルです。",
              },
            ],
          });

          return company.id;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
      break;
    } catch (error) {
      const shouldRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < starterDataTransactionRetries;

      if (!shouldRetry) {
        throw error;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/tasks");

  if (starterCompanyId) {
    revalidatePath(`/companies/${starterCompanyId}`);
  }

  redirect("/");
}
