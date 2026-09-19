import { formatDateOnly } from "@/lib/dates";
import { getAccountsWithBalances, getCategories, getTransactions } from "@/lib/queries";
import { MoneyText } from "@/components/money-text";
import { TransactionActions } from "@/components/transaction-form";
import { TransactionFilters } from "@/components/transaction-filters";

export default async function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  const params = await searchParams;
  const filters = {
    accountId: typeof params.accountId === "string" ? params.accountId : undefined,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  };

  const [accounts, categories, transactions] = await Promise.all([
    getAccountsWithBalances(),
    getCategories(),
    getTransactions(filters),
  ]);

  const exportQuery = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value))) as Record<string, string>,
  ).toString();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Transactions</h1>
          <p className="mt-2 text-muted">Filter the register, add activity, or export the current view as CSV.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/export/transactions${exportQuery ? `?${exportQuery}` : ""}`} className="btn btn-ghost">
            Export CSV
          </a>
          <TransactionActions accounts={accounts} categories={categories} />
        </div>
      </div>

      <TransactionFilters accounts={accounts} categories={categories} current={filters} />

      <div className="overflow-hidden rounded-3xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f2e8] text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Payee</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Memo</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-line">
                <td className="px-5 py-3 text-muted">{formatDateOnly(transaction.date)}</td>
                <td className="px-5 py-3 font-medium">{transaction.payee}</td>
                <td className="px-5 py-3">{transaction.categoryName}</td>
                <td className="px-5 py-3">{transaction.accountName}</td>
                <td className="px-5 py-3 text-muted">{transaction.memo ?? "—"}</td>
                <td className="px-5 py-3 text-right">
                  <MoneyText cents={transaction.amountCents} tone="signed" />
                </td>
                <td className="px-5 py-3 text-right">
                  <TransactionActions accounts={accounts} categories={categories} transaction={transaction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 ? <p className="px-5 py-8 text-sm text-muted">No transactions match these filters.</p> : null}
      </div>
    </div>
  );
}
