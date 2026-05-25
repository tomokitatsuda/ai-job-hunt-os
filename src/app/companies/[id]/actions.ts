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

const parseTaskPriority = (value: FormDataEntryValue | null) => {
  const priority = Number(toNullableString(value));

  if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
    return 3;
  }

  return priority;
};

const parseInterviewDate = (value: FormDataEntryValue | null) => {
  const dateText = toNullableString(value);

  if (!dateText) {
    return null;
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function deleteCompany(companyId: string) {
  const { prisma } = await import("@/lib/prisma");
  const companyToDelete = await prisma.company.findFirst({
    where: {
      id: companyId,
      userId: demoUserId,
    },
    select: {
      id: true,
    },
  });

  if (!companyToDelete) {
    notFound();
  }

  await prisma.$transaction([
    prisma.interviewLog.deleteMany({
      where: {
        companyId,
      },
    }),
    prisma.task.updateMany({
      where: {
        companyId,
        userId: demoUserId,
      },
      data: {
        companyId: null,
      },
    }),
    prisma.company.delete({
      where: {
        id: companyId,
      },
    }),
  ]);

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect("/companies");
}

export async function createTask(companyId: string, formData: FormData) {
  const title = toNullableString(formData.get("title"));

  if (!title) {
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  const companyForTask = await prisma.company.findFirst({
    where: {
      id: companyId,
      userId: demoUserId,
    },
    select: {
      id: true,
    },
  });

  if (!companyForTask) {
    notFound();
  }

  await prisma.task.create({
    data: {
      userId: demoUserId,
      companyId,
      title,
      dueDate: parseTaskDueDate(formData.get("dueDate")),
      priority: parseTaskPriority(formData.get("priority")),
      memo: toNullableString(formData.get("memo")),
    },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function createInterviewLog(
  companyId: string,
  formData: FormData,
) {
  const interviewDate = parseInterviewDate(formData.get("interviewDate"));
  const interviewType = toNullableString(formData.get("interviewType"));
  const questions = toNullableString(formData.get("questions"));
  const answerMemo = toNullableString(formData.get("answerMemo"));
  const goodPoints = toNullableString(formData.get("goodPoints"));
  const improvementPoints = toNullableString(
    formData.get("improvementPoints"),
  );
  const nextPreparation = toNullableString(formData.get("nextPreparation"));

  if (
    !interviewDate &&
    !interviewType &&
    !questions &&
    !answerMemo &&
    !goodPoints &&
    !improvementPoints &&
    !nextPreparation
  ) {
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  const companyForInterviewLog = await prisma.company.findFirst({
    where: {
      id: companyId,
      userId: demoUserId,
    },
    select: {
      id: true,
    },
  });

  if (!companyForInterviewLog) {
    notFound();
  }

  await prisma.interviewLog.create({
    data: {
      companyId,
      interviewDate,
      interviewType,
      questions,
      answerMemo,
      goodPoints,
      improvementPoints,
      nextPreparation,
    },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function toggleTaskCompletion(
  companyId: string,
  formData: FormData,
) {
  const taskId = toNullableString(formData.get("taskId"));

  if (!taskId) {
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: demoUserId,
      companyId,
    },
    select: {
      id: true,
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
      companyId,
    },
    data: {
      isCompleted: !task.isCompleted,
    },
  });

  if (result.count === 0) {
    notFound();
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}
