import { PrismaClient, type AccountType } from "@prisma/client";

const prisma = new PrismaClient();

const categories: { name: string; group: string; isIncome: boolean; sortOrder: number }[] = [
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

const accounts: { key: string; name: string; type: AccountType; institution: string | null; openingBalanceCents: number }[] = [
  { key: "checking", name: "Everyday Checking", type: "CHECKING", institution: "Harbor Credit Union", openingBalanceCents: 325000 },
  { key: "savings", name: "Rainy Day Savings", type: "SAVINGS", institution: "Harbor Credit Union", openingBalanceCents: 1180000 },
  { key: "card", name: "Travel Rewards Visa", type: "CREDIT_CARD", institution: "Northline Card", openingBalanceCents: -112000 },
  { key: "cash", name: "Wallet Cash", type: "CASH", institution: null, openingBalanceCents: 24000 },
];

type SeedTxn = {
  date: string;
  account: string;
  category: string;
  payee: string;
  amountCents: number;
  memo?: string;
};

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

async function main() {
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();

  const createdAccounts = new Map<string, string>();
  for (const account of accounts) {
    const created = await prisma.account.create({
      data: {
        name: account.name,
        type: account.type,
        institution: account.institution,
        openingBalanceCents: account.openingBalanceCents,
      },
    });
    createdAccounts.set(account.key, created.id);
  }

  const createdCategories = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.set(category.name, created.id);
  }

  for (const transaction of transactions) {
    const accountId = createdAccounts.get(transaction.account);
    const categoryId = createdCategories.get(transaction.category);
    if (!accountId || !categoryId) {
      throw new Error(`Missing account or category for ${transaction.payee}`);
    }
    await prisma.transaction.create({
      data: {
        date: new Date(`${transaction.date}T00:00:00.000Z`),
        amountCents: transaction.amountCents,
        payee: transaction.payee,
        memo: transaction.memo,
        accountId,
        categoryId,
      },
    });
  }

  for (const budget of septemberBudgets) {
    const categoryId = createdCategories.get(budget.category);
    if (!categoryId) {
      throw new Error(`Missing budget category ${budget.category}`);
    }
    await prisma.budget.create({
      data: {
        month: "2026-09",
        categoryId,
        amountCents: budget.amountCents,
      },
    });
  }

  console.log(`Seeded ${accounts.length} accounts, ${categories.length} categories, ${transactions.length} transactions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
