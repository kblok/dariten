"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firstZodError, parseAccountInput } from "@/lib/validators";
import type { ActionResult } from "@/lib/types";

function refreshAccountViews() {
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

export async function createAccount(input: unknown): Promise<ActionResult> {
  try {
    const data = parseAccountInput(input);
    await prisma.account.create({ data });
    refreshAccountViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function updateAccount(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseAccountInput(input);
    await prisma.account.update({ where: { id }, data });
    refreshAccountViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const count = await prisma.transaction.count({ where: { accountId: id } });
    if (count > 0) {
      return { ok: false, error: "Move or delete this account's transactions first." };
    }
    await prisma.account.delete({ where: { id } });
    refreshAccountViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}
