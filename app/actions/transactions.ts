"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firstZodError, parseTransactionInput } from "@/lib/validators";
import type { ActionResult } from "@/lib/types";

function refreshTransactionViews() {
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  try {
    const data = parseTransactionInput(input);
    await prisma.transaction.create({ data });
    refreshTransactionViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseTransactionInput(input);
    await prisma.transaction.update({ where: { id }, data });
    refreshTransactionViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    await prisma.transaction.delete({ where: { id } });
    refreshTransactionViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: firstZodError(error) };
  }
}
