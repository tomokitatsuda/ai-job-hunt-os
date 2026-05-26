"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

const demoUserId = "demo-user";

const toNullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

export async function toggleTaskCompletionFromTaskList(formData: FormData) {
  const taskId = toNullableString(formData.get("taskId"));

  if (!taskId) {
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: demoUserId,
    },
    select: {
      id: true,
      companyId: true,
      isCompleted: true,
    },
  });

  if (!task) {
    notFound();
  }

  const result = await prisma.task.updateMany({
    where: {
      id: task.id,
      userId: demoUserId,
    },
    data: {
      isCompleted: !task.isCompleted,
    },
  });

  if (result.count === 0) {
    notFound();
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/companies");

  if (task.companyId) {
    revalidatePath(`/companies/${task.companyId}`);
  }
}
