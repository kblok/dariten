import Dexie, { type Table } from "dexie";
import { toDateOnly } from "@/lib/dates";
import type { AccountRecord, BudgetRecord, CategoryRecord, LedgerSnapshot, TransactionRecord } from "@/lib/models";
import { buildSeedSnapshot } from "@/lib/seed-data";
import type { ActionResult } from "@/lib/types";
import { firstZodError, parseAccountInput, parseBudgetBatch, parseCategoryInput, parseTransactionInput } from "@/lib/validators";

export const LEDGER_DB_NAME = "dariten";

export class DaritenDB extends Dexie {
  accounts!: Table<AccountRecord, string>;
  categories!: Table<CategoryRecord, string>;
  transactions!: Table<TransactionRecord, string>;
  budgets!: Table<BudgetRecord, string>;

  constructor(name = LEDGER_DB_NAME) {
    super(name);
    this.version(1).stores({
      accounts: "id, type, name",
      categories: "id, &name, sortOrder",
      transactions: "id, date, accountId, categoryId",
      budgets: "id, categoryId, month, &[categoryId+month]",
    });
  }
}

let singleton: DaritenDB | null = null;

export function getDb(): DaritenDB {
  if (typeof indexedDB === "undefined") {
    throw new Error("This browser does not expose IndexedDB, so the local ledger cannot be saved.");
  }
  singleton ??= new DaritenDB();
  return singleton;
}

function schemaTables(database: DaritenDB) {
  return [database.accounts, database.categories, database.transactions, database.budgets];
}

async function writeSnapshot(database: DaritenDB, snapshot: LedgerSnapshot): Promise<void> {
  await database.accounts.bulkAdd(snapshot.accounts);
  await database.categories.bulkAdd(snapshot.categories);
  await database.transactions.bulkAdd(snapshot.transactions);
  await database.budgets.bulkAdd(snapshot.budgets);
}

export async function loadSnapshot(database: DaritenDB = getDb()): Promise<LedgerSnapshot> {
  const [accounts, categories, transactions, budgets] = await Promise.all([
    database.accounts.toArray(),
    database.categories.toArray(),
    database.transactions.toArray(),
    database.budgets.toArray(),
  ]);
  return { accounts, categories, transactions, budgets };
}

/** First visit only: an empty accounts store receives the sample household. */
export async function ensureSeeded(database: DaritenDB = getDb()): Promise<void> {
  if ((await database.accounts.count()) > 0) {
    return;
  }
  await database.transaction("rw", schemaTables(database), async () => {
    if ((await database.accounts.count()) > 0) {
      return;
    }
    await writeSnapshot(database, buildSeedSnapshot());
  });
}

/** Replace this browser's ledger with the original sample household. */
export async function resetToSeed(database: DaritenDB = getDb()): Promise<void> {
  await database.transaction("rw", schemaTables(database), async () => {
    await database.accounts.clear();
    await database.categories.clear();
    await database.transactions.clear();
    await database.budgets.clear();
    await writeSnapshot(database, buildSeedSnapshot());
  });
}

function failure(error: unknown): ActionResult {
  return { ok: false, error: firstZodError(error) };
}

function timestamp(): string {
  return new Date().toISOString();
}

export async function createAccount(input: unknown): Promise<ActionResult> {
  try {
    const data = parseAccountInput(input);
    const now = timestamp();
    await getDb().accounts.add({
      id: crypto.randomUUID(),
      name: data.name,
      type: data.type,
      institution: data.institution,
      openingBalanceCents: data.openingBalanceCents,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updateAccount(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseAccountInput(input);
    const updated = await getDb().accounts.update(id, {
      name: data.name,
      type: data.type,
      institution: data.institution,
      openingBalanceCents: data.openingBalanceCents,
      updatedAt: timestamp(),
    });
    if (updated === 0) {
      return { ok: false, error: "That account no longer exists." };
    }
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const database = getDb();
    const count = await database.transactions.where("accountId").equals(id).count();
    if (count > 0) {
      return { ok: false, error: "Move or delete this account's transactions first." };
    }
    await database.accounts.delete(id);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

async function categoryNameTaken(database: DaritenDB, name: string, exceptId?: string): Promise<boolean> {
  const existing = await database.categories.where("name").equals(name).first();
  return Boolean(existing && existing.id !== exceptId);
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  try {
    const data = parseCategoryInput(input);
    const database = getDb();
    if (await categoryNameTaken(database, data.name)) {
      return { ok: false, error: "A category with that name already exists." };
    }
    const last = await database.categories.orderBy("sortOrder").last();
    await database.categories.add({
      id: crypto.randomUUID(),
      name: data.name,
      group: data.group,
      isIncome: data.isIncome,
      sortOrder: (last?.sortOrder ?? 0) + 10,
      createdAt: timestamp(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.name === "ConstraintError") {
      return { ok: false, error: "A category with that name already exists." };
    }
    return failure(error);
  }
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseCategoryInput(input);
    const database = getDb();
    if (await categoryNameTaken(database, data.name, id)) {
      return { ok: false, error: "A category with that name already exists." };
    }
    const updated = await database.categories.update(id, data);
    if (updated === 0) {
      return { ok: false, error: "That category no longer exists." };
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.name === "ConstraintError") {
      return { ok: false, error: "A category with that name already exists." };
    }
    return failure(error);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const database = getDb();
    const count = await database.transactions.where("categoryId").equals(id).count();
    if (count > 0) {
      return { ok: false, error: "Recategorize this category's transactions first." };
    }
    await database.transaction("rw", database.categories, database.budgets, async () => {
      await database.budgets.where("categoryId").equals(id).delete();
      await database.categories.delete(id);
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

async function requireAccountAndCategory(
  database: DaritenDB,
  accountId: string,
  categoryId: string,
): Promise<ActionResult | null> {
  const account = await database.accounts.get(accountId);
  const category = await database.categories.get(categoryId);
  if (!account || !category) {
    return { ok: false, error: "Choose an account and a category that still exist." };
  }
  return null;
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  try {
    const data = parseTransactionInput(input);
    const database = getDb();
    const missing = await requireAccountAndCategory(database, data.accountId, data.categoryId);
    if (missing) {
      return missing;
    }
    const now = timestamp();
    await database.transactions.add({
      id: crypto.randomUUID(),
      date: toDateOnly(data.date),
      amountCents: data.amountCents,
      payee: data.payee,
      memo: data.memo,
      accountId: data.accountId,
      categoryId: data.categoryId,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult> {
  try {
    const data = parseTransactionInput(input);
    const database = getDb();
    const missing = await requireAccountAndCategory(database, data.accountId, data.categoryId);
    if (missing) {
      return missing;
    }
    const updated = await database.transactions.update(id, {
      date: toDateOnly(data.date),
      amountCents: data.amountCents,
      payee: data.payee,
      memo: data.memo,
      accountId: data.accountId,
      categoryId: data.categoryId,
      updatedAt: timestamp(),
    });
    if (updated === 0) {
      return { ok: false, error: "That transaction no longer exists." };
    }
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    await getDb().transactions.delete(id);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function saveBudgets(input: unknown): Promise<ActionResult> {
  try {
    const data = parseBudgetBatch(input);
    const database = getDb();
    const now = timestamp();
    await database.transaction("rw", database.budgets, async () => {
      for (const item of data.items) {
        const existing = await database.budgets
          .where("[categoryId+month]")
          .equals([item.categoryId, data.month])
          .first();
        if (existing) {
          await database.budgets.update(existing.id, { amountCents: item.amountCents, updatedAt: now });
        } else {
          await database.budgets.add({
            id: crypto.randomUUID(),
            categoryId: item.categoryId,
            month: data.month,
            amountCents: item.amountCents,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
