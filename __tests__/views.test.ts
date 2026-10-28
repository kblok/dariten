import { describe, expect, it } from "vitest";
import { savingsRatePercent } from "@/lib/finance";
import { buildSeedSnapshot } from "@/lib/seed-data";
import { getAccountsWithBalances, getBudgetView, getDashboardData, getTransactions } from "@/lib/views";

describe("seeded ledger views", () => {
  const snapshot = buildSeedSnapshot();

  it("builds the sample household", () => {
    expect(snapshot.accounts).toHaveLength(4);
    expect(snapshot.categories).toHaveLength(17);
    expect(snapshot.transactions).toHaveLength(59);
    expect(snapshot.budgets).toHaveLength(11);
  });

  it("orders accounts and keeps the card as a liability", () => {
    const accounts = getAccountsWithBalances(snapshot);
    expect(accounts.map((account) => account.name)).toEqual([
      "Everyday Checking",
      "Rainy Day Savings",
      "Travel Rewards Visa",
      "Wallet Cash",
    ]);
    expect(accounts.find((account) => account.type === "CREDIT_CARD")?.balanceCents).toBeLessThan(0);
  });

  it("computes September budget vs actual for groceries", () => {
    const view = getBudgetView(snapshot, "2026-09");
    expect(view.rows.find((row) => row.name === "Groceries")).toMatchObject({
      budgetCents: 40000,
      actualCents: 24877,
      remainingCents: 15123,
    });
  });

  it("filters the register and summarizes September cash flow", () => {
    const checking = snapshot.accounts.find((account) => account.name === "Everyday Checking");
    const rows = getTransactions(snapshot, { accountId: checking?.id, from: "2026-09-01", to: "2026-09-30" });
    expect(rows.every((row) => row.accountName === "Everyday Checking")).toBe(true);
    expect(rows.some((row) => row.payee === "Oak & Pine Residences")).toBe(true);
    expect(rows.some((row) => row.payee === "Shell")).toBe(false);

    const dashboard = getDashboardData(snapshot, "2026-09");
    expect(dashboard.netWorthCents).toBe(dashboard.accounts.reduce((sum, account) => sum + account.balanceCents, 0));
    expect(dashboard.savingsRatePercent).toBe(savingsRatePercent(dashboard.incomeCents, dashboard.spendingCents));
    expect(dashboard.incomeCents).toBeGreaterThan(0);
    expect(dashboard.recent[0]).toMatchObject({ payee: "Farmers Market", date: "2026-09-19" });
  });
});
