import { beforeEach, describe, expect, it } from "vitest";
import {
  createCategory,
  createTransaction,
  deleteAccount,
  ensureSeeded,
  loadSnapshot,
  resetToSeed,
  saveBudgets,
} from "@/lib/db";
import { getBudgetView } from "@/lib/views";

describe("indexeddb ledger", () => {
  beforeEach(async () => {
    await resetToSeed();
  });

  it("seeds once and keeps a new transaction until reset", async () => {
    await ensureSeeded();
    await ensureSeeded();
    expect((await loadSnapshot()).accounts).toHaveLength(4);

    const created = await createTransaction({
      date: "2026-10-02",
      payee: "Test Cafe",
      accountId: "seed-acct-checking",
      categoryId: "seed-cat-dining-out",
      amount: "12.50",
      flow: "out",
      memo: "latte",
    });
    expect(created).toEqual({ ok: true });

    const saved = (await loadSnapshot()).transactions.find((transaction) => transaction.payee === "Test Cafe");
    expect(saved).toMatchObject({ amountCents: -1250, memo: "latte", date: "2026-10-02" });

    await resetToSeed();
    expect((await loadSnapshot()).transactions.some((transaction) => transaction.payee === "Test Cafe")).toBe(false);
  });

  it("refuses to delete an account that still has transactions", async () => {
    expect(await deleteAccount("seed-acct-checking")).toEqual({
      ok: false,
      error: "Move or delete this account's transactions first.",
    });
  });

  it("rejects a duplicate category name and stores a budget", async () => {
    expect(await createCategory({ name: "Groceries", group: "Food", isIncome: false })).toMatchObject({ ok: false });

    const groceries = (await loadSnapshot()).categories.find((category) => category.name === "Groceries");
    expect(
      await saveBudgets({
        month: "2026-10",
        items: [{ categoryId: groceries?.id, amount: "50.00" }],
      }),
    ).toEqual({ ok: true });

    const view = getBudgetView(await loadSnapshot(), "2026-10");
    expect(view.rows.find((row) => row.name === "Groceries")?.budgetCents).toBe(5000);
  });
});