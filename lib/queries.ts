import { prisma } from "@/lib/prisma";
import { currentMonth, monthRange, toDateOnly } from "@/lib/dates";
import { savingsRatePercent, spendingByCategory } from "@/lib/finance";
import { accountBalanceCents, netWorthCents } from "@/lib/money";

export type TransactionFilters = {
  accountId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

export async function getAccountsWithBalances() {
  const accounts = await prisma.account.findMany({
    include: { transactions: { select: { amountCents: true } } },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    institution: account.institution,
    openingBalanceCents: account.openingBalanceCents,
    transactionCount: account.transactions.length,
    balanceCents: accountBalanceCents(
      account.openingBalanceCents,
      account.transactions.map((transaction) => transaction.amountCents),
    ),
  }));
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { transactions: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: filters.accountId || undefined,
      categoryId: filters.categoryId || undefined,
      date: {
        gte: filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined,
        lte: filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined,
      },
    },
    include: {
      account: true,
      category: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    date: toDateOnly(transaction.date),
    amountCents: transaction.amountCents,
    payee: transaction.payee,
    memo: transaction.memo,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    accountName: transaction.account.name,
    categoryName: transaction.category.name,
    isIncome: transaction.category.isIncome,
  }));
}

export async function getDashboardData(month = currentMonth()) {
  const { start, end } = monthRange(month);
  const [accounts, recent, monthTransactions] = await Promise.all([
    getAccountsWithBalances(),
    prisma.transaction.findMany({
      include: { account: true, category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
      include: { category: true },
    }),
  ]);

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
      monthTransactions.map((transaction) => ({
        amountCents: transaction.amountCents,
        categoryName: transaction.category.name,
        isIncome: transaction.category.isIncome,
      })),
    ),
    recent: recent.map((transaction) => ({
      id: transaction.id,
      date: toDateOnly(transaction.date),
      amountCents: transaction.amountCents,
      payee: transaction.payee,
      accountName: transaction.account.name,
      categoryName: transaction.category.name,
    })),
  };
}

export async function getBudgetView(month: string) {
  const { start, end } = monthRange(month);
  const [categories, budgets, transactions] = await Promise.all([
    prisma.category.findMany({
      where: { isIncome: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.budget.findMany({ where: { month } }),
    prisma.transaction.findMany({
      where: {
        date: { gte: start, lt: end },
        amountCents: { lt: 0 },
      },
    }),
  ]);

  const budgetByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget.amountCents]));
  const actualByCategory = new Map<string, number>();
  for (const transaction of transactions) {
    actualByCategory.set(
      transaction.categoryId,
      (actualByCategory.get(transaction.categoryId) ?? 0) + Math.abs(transaction.amountCents),
    );
  }

  const rows = categories.map((category) => {
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
