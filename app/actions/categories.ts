"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firstZodError, parseCategoryInput } from "@/lib/validators";
import type { ActionResult } from "@/lib/types";

function refreshCategoryViews() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  try {
    const data = parseCategoryInput(input);
    const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
    await prisma.category.create({
      data: {
        ...data,
        sortOrder: (last._max.sortOrder ?? 0) + 10,
      },
    });
    refreshCategoryViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseCategoryInput(input);
    await prisma.category.update({ where: { id }, data });
    refreshCategoryViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const count = await prisma.transaction.count({ where: { categoryId: id } });
    if (count > 0) {
      return { ok: false, error: "Recategorize this category's transactions first." };
    }
    await prisma.category.delete({ where: { id } });
    refreshCategoryViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}
