export const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "CREDIT_CARD", "CASH"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: "Checking",
  SAVINGS: "Savings",
  CREDIT_CARD: "Credit card",
  CASH: "Cash",
};

export function isLiabilityType(type: AccountType): boolean {
  return type === "CREDIT_CARD";
}

export function spendingByCategory(
  transactions: { amountCents: number; categoryName: string; isIncome: boolean }[],
): { name: string; amountCents: number }[] {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.isIncome || transaction.amountCents >= 0) {
      continue;
    }
    const current = totals.get(transaction.categoryName) ?? 0;
    totals.set(transaction.categoryName, current + Math.abs(transaction.amountCents));
  }

  return [...totals.entries()]
    .map(([name, amountCents]) => ({ name, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

/** Share of this month's income that was not spent: (income − spending) / income. */
export function savingsRatePercent(incomeCents: number, spendingCents: number): number {
  if (incomeCents <= 0) {
    return 0;
  }
  return Math.round(((incomeCents - spendingCents) / incomeCents) * 100);
}

export function budgetProgress(budgetCents: number, actualCents: number): {
  remainingCents: number;
  percent: number;
  over: boolean;
} {
  const remainingCents = budgetCents - actualCents;
  const percent = budgetCents === 0 ? (actualCents > 0 ? 100 : 0) : Math.min(100, Math.round((actualCents / budgetCents) * 100));
  return {
    remainingCents,
    percent,
    over: remainingCents < 0,
  };
}

export function matchesTransactionFilters(
  transaction: { accountId: string; categoryId: string; date: string },
  filters: { accountId?: string; categoryId?: string; from?: string; to?: string },
): boolean {
  if (filters.accountId && transaction.accountId !== filters.accountId) {
    return false;
  }
  if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
    return false;
  }
  if (filters.from && transaction.date < filters.from) {
    return false;
  }
  if (filters.to && transaction.date > filters.to) {
    return false;
  }
  return true;
}

export function toCsvRow(values: Array<string | number>): string {
  return values
    .map((value) => {
      const text = String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replaceAll('"', '""')}"`;
      }
      return text;
    })
    .join(",");
}

export function transactionsToCsv(
  rows: {
    date: string;
    payee: string;
    category: string;
    account: string;
    amountCents: number;
    memo: string;
  }[],
): string {
  const header = toCsvRow(["Date", "Payee", "Category", "Account", "Amount", "Memo"]);
  const body = rows.map((row) =>
    toCsvRow([
      row.date,
      row.payee,
      row.category,
      row.account,
      (row.amountCents / 100).toFixed(2),
      row.memo,
    ]),
  );
  return [header, ...body].join("\n");
}
