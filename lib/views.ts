import { currentMonth, monthRange, toDateOnly } from "@/lib/dates";
import { matchesTransactionFilters, savingsRatePercent, spendingByCategory, type AccountType } from "@/lib/finance";
import { accountBalanceCents, netWorthCents } from "@/lib/money";
import type { LedgerSnapshot } from "@/lib/models";

export type TransactionFilters = {
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

const TYPE_RANK: Record<AccountType, number> = {
  CHECKING: 0,
  SAVINGS: 1,
  CREDIT_CARD: 2,
  CASH: 3,
};

function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

export function getAccountsWithBalances(snapshot: LedgerSnapshot) {
  const amountsByAccount = new Map<string, number[]>();
  for (const transaction of snapshot.transactions) {
    const amounts = amountsByAccount.get(transaction.accountId) ?? [];
    amounts.push(transaction.amountCents);
    amountsByAccount.set(transaction.accountId, amounts);
  }

  return [...snapshot.accounts]
    .sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type] || byName(a, b))
    .map((account) => {
      const amounts = amountsByAccount.get(account.id) ?? [];
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        institution: account.institution,
        openingBalanceCents: account.openingBalanceCents,
        transactionCount: amounts.length,
        balanceCents: accountBalanceCents(account.openingBalanceCents, amounts),
      };
    });
}

export function getCategories(snapshot: LedgerSnapshot) {
  const counts = new Map<string, number>();
  for (const transaction of snapshot.transactions) {
    counts.set(transaction.categoryId, (counts.get(transaction.categoryId) ?? 0) + 1);
  }

  return [...snapshot.categories]
    .sort((a, b) => a.sortOrder - b.sortOrder || byName(a, b))
    .map((category) => ({
      id: category.id,
      name: category.name,
      group: category.group,
      isIncome: category.isIncome,
      sortOrder: category.sortOrder,
      transactionCount: counts.get(category.id) ?? 0,
    }));
}

export function getTransactions(snapshot: LedgerSnapshot, filters: TransactionFilters = {}) {
  const accounts = new Map(snapshot.accounts.map((account) => [account.id, account]));
  const categories = new Map(snapshot.categories.map((category) => [category.id, category]));

  return snapshot.transactions
    .filter((transaction) => matchesTransactionFilters(transaction, filters))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .flatMap((transaction) => {
      const account = accounts.get(transaction.accountId);
      const category = categories.get(transaction.categoryId);
      if (!account || !category) {
        return [];
      }
      return [
        {
          id: transaction.id,
          date: transaction.date,
          amountCents: transaction.amountCents,
          payee: transaction.payee,
          memo: transaction.memo,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          accountName: account.name,
          categoryName: category.name,
          isIncome: category.isIncome,
        },
      ];
    });
}

export function getDashboardData(snapshot: LedgerSnapshot, month = currentMonth()) {
  const { start, end } = monthRange(month);
  const startKey = toDateOnly(start);
  const endKey = toDateOnly(end);
  const accounts = getAccountsWithBalances(snapshot);
  const categories = new Map(snapshot.categories.map((category) => [category.id, category]));
  const monthTransactions = snapshot.transactions.filter(
    (transaction) => transaction.date >= startKey && transaction.date < endKey,
  );

  const incomeCents = monthTransactions
    .filter((transaction) => transaction.amountCents > 0)
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const spendingCents = monthTransactions
    .filter((transaction) => transaction.amountCents < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);

  return {
    month,
    accounts,
    netWorthCents: netWorthCents(accounts.map((account) => account.balanceCents)),
    incomeCents,
    spendingCents,
    savingsRatePercent: savingsRatePercent(incomeCents, spendingCents),
    spending: spendingByCategory(
      monthTransactions.flatMap((transaction) => {
        const category = categories.get(transaction.categoryId);
        if (!category) {
          return [];
        }
        return [
          {
            amountCents: transaction.amountCents,
            categoryName: category.name,
            isIncome: category.isIncome,
          },
        ];
      }),
    ),
    recent: getTransactions(snapshot)
      .slice(0, 8)
      .map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        amountCents: transaction.amountCents,
        payee: transaction.payee,
        accountName: transaction.accountName,
        categoryName: transaction.categoryName,
      })),
  };
}

export function getBudgetView(snapshot: LedgerSnapshot, month: string) {
  const { start, end } = monthRange(month);
  const startKey = toDateOnly(start);
  const endKey = toDateOnly(end);
  const budgetByCategory = new Map(
    snapshot.budgets.filter((budget) => budget.month === month).map((budget) => [budget.categoryId, budget.amountCents]),
  );
  const actualByCategory = new Map<string, number>();
  for (const transaction of snapshot.transactions) {
    if (transaction.date < startKey || transaction.date >= endKey || transaction.amountCents >= 0) {
      continue;
    }
    actualByCategory.set(
      transaction.categoryId,
      (actualByCategory.get(transaction.categoryId) ?? 0) + Math.abs(transaction.amountCents),
    );
  }

  const rows = snapshot.categories
    .filter((category) => !category.isIncome)
    .sort((a, b) => a.sortOrder - b.sortOrder || byName(a, b))
    .map((category) => {
      const budgetCents = budgetByCategory.get(category.id) ?? 0;
      const actualCents = actualByCategory.get(category.id) ?? 0;
      return {
        categoryId: category.id,
        name: category.name,
        group: category.group,
        budgetCents,
        actualCents,
        remainingCents: budgetCents - actualCents,
      };
    });

  return {
    month,
    rows,
    budgetedCents: rows.reduce((sum, row) => sum + row.budgetCents, 0),
    actualCents: rows.reduce((sum, row) => sum + row.actualCents, 0),
  };
}
