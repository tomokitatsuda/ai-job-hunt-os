"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

const demoUserId = "demo-user";

const toNullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const parseTaskDueDate = (value: FormDataEntryValue | null) => {
  const dateText = toNullableString(value);

  if (!dateText) {
    return null;
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function createGeneralTask(formData: FormData) {
  const title = toNullableString(formData.get("title"));

  if (!title) {
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.task.create({
    data: {
      userId: demoUserId,
      companyId: null,
      title,
      dueDate: parseTaskDueDate(formData.get("dueDate")),
      memo: toNullableString(formData.get("memo")),
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

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

export async function updateTaskFromTaskList(
  taskId: string,
  formData: FormData,
) {
  const title = toNullableString(formData.get("title"));

  if (!title) {
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
      title,
      dueDate: parseTaskDueDate(formData.get("dueDate")),
      memo: toNullableString(formData.get("memo")),
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

  redirect("/tasks");
}

export async function deleteTaskFromTaskList(formData: FormData) {
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
    },
  });

  if (!task) {
    notFound();
  }

  const result = await prisma.task.deleteMany({
    where: {
      id: task.id,
      userId: demoUserId,
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

  redirect("/tasks");
}
