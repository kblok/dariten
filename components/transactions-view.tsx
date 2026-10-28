"use client";

import { LedgerMessage, useLedger } from "@/components/ledger-provider";
import { MoneyText } from "@/components/money-text";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionActions } from "@/components/transaction-form";
import { formatDateOnly } from "@/lib/dates";
import { transactionsToCsv } from "@/lib/finance";
import { getAccountsWithBalances, getCategories, getTransactions, type TransactionFilters as Filters } from "@/lib/views";

export function TransactionsView({ filters }: { filters: Filters }) {
  const { snapshot, error } = useLedger();
  const accounts = snapshot ? getAccountsWithBalances(snapshot) : null;
  const categories = snapshot ? getCategories(snapshot) : null;
  const transactions = snapshot ? getTransactions(snapshot, filters) : null;

  function onExport() {
    if (!transactions) {
      return;
    }
    const csv = transactionsToCsv(
      transactions.map((row) => ({
        date: row.date,
        payee: row.payee,
        category: row.categoryName,
        account: row.accountName,
        amountCents: row.amountCents,
        memo: row.memo ?? "",
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transactions.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Transactions</h1>
          <p className="mt-2 text-muted">Filter the register, add activity, or export the current view as CSV.</p>
        </div>
        {accounts && categories ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={onExport}>
              Export CSV
            </button>
            <TransactionActions accounts={accounts} categories={categories} />
          </div>
        ) : null}
      </div>

      {accounts && categories && transactions ? (
        <>
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
            {transactions.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted">No transactions match these filters.</p>
            ) : null}
          </div>
        </>
      ) : (
        <LedgerMessage error={error} loading={!error} />
      )}
    </div>
  );
}
