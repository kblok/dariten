import { describe, expect, it } from "vitest";
import { budgetProgress, matchesTransactionFilters, savingsRatePercent, spendingByCategory, transactionsToCsv } from "@/lib/finance";

describe("finance helpers", () => {
  it("rolls expense categories into a spending snapshot", () => {
    const snapshot = spendingByCategory([
      { amountCents: -12844, categoryName: "Groceries", isIncome: false },
      { amountCents: -8633, categoryName: "Groceries", isIncome: false },
      { amountCents: 320000, categoryName: "Paycheck", isIncome: true },
      { amountCents: -1480, categoryName: "Dining Out", isIncome: false },
    ]);

    expect(snapshot[0]).toEqual({ name: "Groceries", amountCents: 21477 });
    expect(snapshot).toHaveLength(2);
  });

  it("filters transactions by account, category, and date", () => {
    const row = { accountId: "chk", categoryId: "groc", date: "2026-09-08" };
    expect(matchesTransactionFilters(row, { accountId: "chk", from: "2026-09-01" })).toBe(true);
    expect(matchesTransactionFilters(row, { categoryId: "gas" })).toBe(false);
    expect(matchesTransactionFilters(row, { to: "2026-09-01" })).toBe(false);
  });

  it("computes savings rate as leftover income over income", () => {
    expect(savingsRatePercent(721000, 321310)).toBe(55);
    expect(savingsRatePercent(10000, 10000)).toBe(0);
    expect(savingsRatePercent(10000, 12000)).toBe(-20);
    expect(savingsRatePercent(0, 5000)).toBe(0);
    expect(savingsRatePercent(-100, 50)).toBe(0);
  });

  it("computes budget remaining and percent", () => {
    expect(budgetProgress(40000, 24877)).toEqual({
      remainingCents: 15123,
      percent: 62,
      over: false,
    });
    expect(budgetProgress(5000, 6200).over).toBe(true);
  });

  it("exports transactions as escaped CSV", () => {
    const csv = transactionsToCsv([
      {
        date: "2026-09-03",
        payee: 'Whole Foods, "Market"',
        category: "Groceries",
        account: "Everyday Checking",
        amountCents: -12844,
        memo: "Weekly shop",
      },
    ]);

    expect(csv.split("\n")[0]).toBe("Date,Payee,Category,Account,Amount,Memo");
    expect(csv).toContain("-128.44");
    expect(csv).toContain('"Whole Foods, ""Market"""');
  });
});
