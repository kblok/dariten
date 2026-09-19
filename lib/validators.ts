import { z } from "zod";
import { dollarsToCents } from "@/lib/money";
import { parseDateOnly } from "@/lib/dates";
import { ACCOUNT_TYPES } from "@/lib/finance";

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  type: z.enum(ACCOUNT_TYPES),
  institution: z.string().trim().max(80).optional().or(z.literal("")),
  openingBalance: z.string().min(1, "Opening balance is required"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  group: z.string().trim().min(1, "Group is required").max(40),
  isIncome: z.boolean(),
});

export const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  payee: z.string().trim().min(1, "Payee is required").max(80),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  flow: z.enum(["in", "out"]),
  memo: z.string().trim().max(160).optional().or(z.literal("")),
});

export const budgetItemSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.string().min(1),
});

export const budgetBatchSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  items: z.array(budgetItemSchema),
});

export function parseAccountInput(input: unknown) {
  const data = accountSchema.parse(input);
  return {
    name: data.name,
    type: data.type,
    institution: data.institution || null,
    openingBalanceCents: dollarsToCents(data.openingBalance),
  };
}

export function parseCategoryInput(input: unknown) {
  return categorySchema.parse(input);
}

export function parseTransactionInput(input: unknown) {
  const data = transactionSchema.parse(input);
  const unsigned = dollarsToCents(data.amount);
  if (unsigned < 0) {
    throw new Error("Enter the amount as a positive number and choose Income or Expense");
  }
  return {
    date: parseDateOnly(data.date),
    payee: data.payee,
    accountId: data.accountId,
    categoryId: data.categoryId,
    amountCents: data.flow === "out" ? -unsigned : unsigned,
    memo: data.memo || null,
  };
}

export function parseBudgetBatch(input: unknown) {
  const data = budgetBatchSchema.parse(input);
  return {
    month: data.month,
    items: data.items.map((item) => ({
      categoryId: item.categoryId,
      amountCents: dollarsToCents(item.amount),
    })),
  };
}

export function firstZodError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}
