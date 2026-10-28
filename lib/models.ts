import type { AccountType } from "@/lib/finance";

/** Browser copy of the old Prisma models. Dates are `YYYY-MM-DD`; timestamps are ISO strings. */
export type AccountRecord = {
  id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  openingBalanceCents: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  group: string;
  isIncome: boolean;
  sortOrder: number;
  createdAt: string;
};

export type TransactionRecord = {
  id: string;
  date: string;
  amountCents: number;
  payee: string;
  memo: string | null;
  accountId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetRecord = {
  id: string;
  categoryId: string;
  month: string;
  amountCents: number;
  createdAt: string;
  updatedAt: string;
};

export type LedgerSnapshot = {
  accounts: AccountRecord[];
  categories: CategoryRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
};
