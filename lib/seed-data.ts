import type { AccountType } from "@/lib/finance";
import type { AccountRecord, BudgetRecord, CategoryRecord, LedgerSnapshot, TransactionRecord } from "@/lib/models";

const SEED_EPOCH = Date.parse("2026-07-01T00:00:00.000Z");

type SeedCategory = { name: string; group: string; isIncome: boolean; sortOrder: number };
type SeedAccount = { key: string; name: string; type: AccountType; institution: string | null; openingBalanceCents: number };
type SeedTxn = { date: string; account: string; category: string; payee: string; amountCents: number; memo?: string };

const categories: SeedCategory[] = [
  { name: "Paycheck", group: "Income", isIncome: true, sortOrder: 10 },
  { name: "Interest", group: "Income", isIncome: true, sortOrder: 20 },
  { name: "Other Income", group: "Income", isIncome: true, sortOrder: 30 },
  { name: "Rent / Mortgage", group: "Housing", isIncome: false, sortOrder: 40 },
  { name: "Utilities", group: "Housing", isIncome: false, sortOrder: 50 },
  { name: "Groceries", group: "Food", isIncome: false, sortOrder: 60 },
  { name: "Dining Out", group: "Food", isIncome: false, sortOrder: 70 },
  { name: "Gas", group: "Transport", isIncome: false, sortOrder: 80 },
  { name: "Transit", group: "Transport", isIncome: false, sortOrder: 90 },
  { name: "Shopping", group: "Lifestyle", isIncome: false, sortOrder: 100 },
  { name: "Entertainment", group: "Lifestyle", isIncome: false, sortOrder: 110 },
  { name: "Subscriptions", group: "Lifestyle", isIncome: false, sortOrder: 120 },
  { name: "Medical", group: "Health", isIncome: false, sortOrder: 130 },
  { name: "Fitness", group: "Health", isIncome: false, sortOrder: 140 },
  { name: "Credit Card Payment", group: "Transfers", isIncome: false, sortOrder: 150 },
  { name: "Transfer", group: "Transfers", isIncome: false, sortOrder: 160 },
  { name: "Uncategorized", group: "Other", isIncome: false, sortOrder: 170 },
];

const accounts: SeedAccount[] = [
  { key: "checking", name: "Everyday Checking", type: "CHECKING", institution: "Harbor Credit Union", openingBalanceCents: 325000 },
  { key: "savings", name: "Rainy Day Savings", type: "SAVINGS", institution: "Harbor Credit Union", openingBalanceCents: 1180000 },
  { key: "card", name: "Travel Rewards Visa", type: "CREDIT_CARD", institution: "Northline Card", openingBalanceCents: -112000 },
  { key: "cash", name: "Wallet Cash", type: "CASH", institution: null, openingBalanceCents: 24000 },
];

const transactions: SeedTxn[] = [
  { date: "2026-07-01", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000, memo: "Biweekly pay" },
  { date: "2026-07-01", account: "checking", category: "Rent / Mortgage", payee: "Oak & Pine Residences", amountCents: -185000 },
  { date: "2026-07-05", account: "checking", category: "Utilities", payee: "City Light & Water", amountCents: -8840 },
  { date: "2026-07-06", account: "checking", category: "Groceries", payee: "Whole Foods", amountCents: -11900 },
  { date: "2026-07-08", account: "checking", category: "Transfer", payee: "Transfer to Savings", amountCents: -40000 },
  { date: "2026-07-08", account: "savings", category: "Transfer", payee: "Transfer from Checking", amountCents: 40000 },
  { date: "2026-07-10", account: "card", category: "Dining Out", payee: "Pizzeria Locale", amountCents: -3675 },
  { date: "2026-07-12", account: "card", category: "Gas", payee: "Shell", amountCents: -4780 },
  { date: "2026-07-15", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000 },
  { date: "2026-07-15", account: "checking", category: "Credit Card Payment", payee: "Northline Card Payment", amountCents: -30000 },
  { date: "2026-07-15", account: "card", category: "Credit Card Payment", payee: "Payment thank you", amountCents: 30000 },
  { date: "2026-07-18", account: "card", category: "Shopping", payee: "REI", amountCents: -12400 },
  { date: "2026-07-20", account: "checking", category: "Medical", payee: "Lakeside Clinic", amountCents: -6500 },
  { date: "2026-07-22", account: "checking", category: "Groceries", payee: "Trader Joe's", amountCents: -8150 },
  { date: "2026-07-25", account: "card", category: "Entertainment", payee: "Alamo Drafthouse", amountCents: -4500 },
  { date: "2026-07-28", account: "card", category: "Dining Out", payee: "Taco Nido", amountCents: -2210 },
  { date: "2026-07-31", account: "savings", category: "Interest", payee: "Harbor Credit Union", amountCents: 388 },

  { date: "2026-08-01", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000 },
  { date: "2026-08-01", account: "checking", category: "Rent / Mortgage", payee: "Oak & Pine Residences", amountCents: -185000 },
  { date: "2026-08-03", account: "checking", category: "Utilities", payee: "Harbor Fiber", amountCents: -7999, memo: "Internet" },
  { date: "2026-08-04", account: "checking", category: "Groceries", payee: "Whole Foods", amountCents: -14210 },
  { date: "2026-08-05", account: "checking", category: "Transfer", payee: "Transfer to Savings", amountCents: -40000 },
  { date: "2026-08-05", account: "savings", category: "Transfer", payee: "Transfer from Checking", amountCents: 40000 },
  { date: "2026-08-07", account: "card", category: "Dining Out", payee: "Sushi Katsu", amountCents: -4250 },
  { date: "2026-08-09", account: "card", category: "Gas", payee: "Shell", amountCents: -5200 },
  { date: "2026-08-11", account: "card", category: "Subscriptions", payee: "Spotify", amountCents: -1199 },
  { date: "2026-08-12", account: "checking", category: "Groceries", payee: "Trader Joe's", amountCents: -9120 },
  { date: "2026-08-14", account: "savings", category: "Interest", payee: "Harbor Credit Union", amountCents: 412 },
  { date: "2026-08-15", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000 },
  { date: "2026-08-15", account: "checking", category: "Credit Card Payment", payee: "Northline Card Payment", amountCents: -40000 },
  { date: "2026-08-15", account: "card", category: "Credit Card Payment", payee: "Payment thank you", amountCents: 40000 },
  { date: "2026-08-16", account: "card", category: "Dining Out", payee: "Sweetgreen", amountCents: -2800 },
  { date: "2026-08-18", account: "card", category: "Shopping", payee: "Madewell", amountCents: -8845 },
  { date: "2026-08-20", account: "checking", category: "Fitness", payee: "Movement Gym", amountCents: -4900 },
  { date: "2026-08-22", account: "cash", category: "Dining Out", payee: "Blue Bottle", amountCents: -550 },
  { date: "2026-08-25", account: "checking", category: "Groceries", payee: "Farmers Market", amountCents: -7618 },
  { date: "2026-08-28", account: "card", category: "Entertainment", payee: "Metro Cinema", amountCents: -3200 },
  { date: "2026-08-30", account: "card", category: "Dining Out", payee: "Bar Tonno", amountCents: -5420 },

  { date: "2026-09-01", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000 },
  { date: "2026-09-01", account: "checking", category: "Rent / Mortgage", payee: "Oak & Pine Residences", amountCents: -185000 },
  { date: "2026-09-02", account: "checking", category: "Utilities", payee: "City Light & Water", amountCents: -9412 },
  { date: "2026-09-03", account: "checking", category: "Groceries", payee: "Whole Foods", amountCents: -12844 },
  { date: "2026-09-04", account: "checking", category: "Transfer", payee: "Transfer to Savings", amountCents: -40000 },
  { date: "2026-09-04", account: "savings", category: "Transfer", payee: "Transfer from Checking", amountCents: 40000 },
  { date: "2026-09-05", account: "card", category: "Dining Out", payee: "Blue Bottle", amountCents: -675 },
  { date: "2026-09-06", account: "card", category: "Gas", payee: "Shell", amountCents: -4820 },
  { date: "2026-09-07", account: "card", category: "Subscriptions", payee: "Netflix", amountCents: -1599 },
  { date: "2026-09-08", account: "checking", category: "Groceries", payee: "Trader Joe's", amountCents: -8633 },
  { date: "2026-09-10", account: "card", category: "Dining Out", payee: "Chipotle", amountCents: -1480 },
  { date: "2026-09-11", account: "card", category: "Transit", payee: "SpotHero", amountCents: -1800 },
  { date: "2026-09-12", account: "card", category: "Shopping", payee: "Target", amountCents: -6219 },
  { date: "2026-09-15", account: "checking", category: "Paycheck", payee: "Northline Studio", amountCents: 320000 },
  { date: "2026-09-15", account: "checking", category: "Credit Card Payment", payee: "Northline Card Payment", amountCents: -35000 },
  { date: "2026-09-15", account: "card", category: "Credit Card Payment", payee: "Payment thank you", amountCents: 35000 },
  { date: "2026-09-16", account: "card", category: "Dining Out", payee: "Sweetgreen", amountCents: -1640 },
  { date: "2026-09-17", account: "checking", category: "Medical", payee: "CVS Pharmacy", amountCents: -2788 },
  { date: "2026-09-18", account: "checking", category: "Transfer", payee: "ATM Withdrawal", amountCents: -6000 },
  { date: "2026-09-18", account: "cash", category: "Transfer", payee: "ATM Deposit", amountCents: 6000 },
  { date: "2026-09-19", account: "cash", category: "Groceries", payee: "Farmers Market", amountCents: -3400 },
];

const septemberBudgets: { category: string; amountCents: number }[] = [
  { category: "Rent / Mortgage", amountCents: 185000 },
  { category: "Utilities", amountCents: 12000 },
  { category: "Groceries", amountCents: 40000 },
  { category: "Dining Out", amountCents: 20000 },
  { category: "Gas", amountCents: 12000 },
  { category: "Transit", amountCents: 6000 },
  { category: "Shopping", amountCents: 15000 },
  { category: "Entertainment", amountCents: 8000 },
  { category: "Subscriptions", amountCents: 5000 },
  { category: "Medical", amountCents: 8000 },
  { category: "Fitness", amountCents: 5000 },
];

function seedTimestamp(index: number): string {
  return new Date(SEED_EPOCH + index * 1000).toISOString();
}

function categoryId(name: string): string {
  return `seed-cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

/** Starter household copied into IndexedDB when a browser's ledger is empty. */
export function buildSeedSnapshot(): LedgerSnapshot {
  const createdAt = seedTimestamp(0);
  const accountRecords: AccountRecord[] = accounts.map((account) => ({
    id: `seed-acct-${account.key}`,
    name: account.name,
    type: account.type,
    institution: account.institution,
    openingBalanceCents: account.openingBalanceCents,
    createdAt,
    updatedAt: createdAt,
  }));
  const accountIds = new Map(accounts.map((account, index) => [account.key, accountRecords[index].id]));

  const categoryRecords: CategoryRecord[] = categories.map((category) => ({
    id: categoryId(category.name),
    name: category.name,
    group: category.group,
    isIncome: category.isIncome,
    sortOrder: category.sortOrder,
    createdAt,
  }));
  const categoryIds = new Map(categoryRecords.map((category) => [category.name, category.id]));

  const transactionRecords: TransactionRecord[] = transactions.map((transaction, index) => {
    const accountId = accountIds.get(transaction.account);
    const linkedCategoryId = categoryIds.get(transaction.category);
    if (!accountId || !linkedCategoryId) {
      throw new Error(`Missing account or category for ${transaction.payee}`);
    }
    const timestamp = seedTimestamp(index + 1);
    return {
      id: `seed-txn-${String(index + 1).padStart(3, "0")}`,
      date: transaction.date,
      amountCents: transaction.amountCents,
      payee: transaction.payee,
      memo: transaction.memo ?? null,
      accountId,
      categoryId: linkedCategoryId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  const budgetRecords: BudgetRecord[] = septemberBudgets.map((budget, index) => {
    const linkedCategoryId = categoryIds.get(budget.category);
    if (!linkedCategoryId) {
      throw new Error(`Missing budget category ${budget.category}`);
    }
    const timestamp = seedTimestamp(transactions.length + index + 1);
    return {
      id: `seed-budget-${categoryId(budget.category).replace("seed-cat-", "")}`,
      categoryId: linkedCategoryId,
      month: "2026-09",
      amountCents: budget.amountCents,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  return {
    accounts: accountRecords,
    categories: categoryRecords,
    transactions: transactionRecords,
    budgets: budgetRecords,
  };
}
