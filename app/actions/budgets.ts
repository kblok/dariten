"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firstZodError, parseBudgetBatch } from "@/lib/validators";
import type { ActionResult } from "@/lib/types";

export async function saveBudgets(input: unknown): Promise<ActionResult> {
  try {
    const data = parseBudgetBatch(input);
    await prisma.$transaction(
      data.items.map((item) =>
        prisma.budget.upsert({
          where: {
            categoryId_month: {
              categoryId: item.categoryId,
              month: data.month,
            },
          },
          create: {
            categoryId: item.categoryId,
            month: data.month,
            amountCents: item.amountCents,
          },
          update: { amountCents: item.amountCents },
        }),
      ),
    );
    revalidatePath("/budgets");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}
