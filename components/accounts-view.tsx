"use client";

import { AccountActions } from "@/components/account-form";
import { LedgerMessage, useLedger } from "@/components/ledger-provider";
import { MoneyText } from "@/components/money-text";
import { ACCOUNT_TYPE_LABELS, isLiabilityType } from "@/lib/finance";
import { getAccountsWithBalances } from "@/lib/views";

export function AccountsView() {
  const { snapshot, error } = useLedger();
  const accounts = snapshot ? getAccountsWithBalances(snapshot) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Accounts</h1>
          <p className="mt-2 text-muted">Checking, savings, credit cards, and cash. Balances update from the register.</p>
        </div>
        {accounts ? <AccountActions /> : null}
      </div>

      {accounts ? (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <article
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-panel p-5"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{ACCOUNT_TYPE_LABELS[account.type]}</p>
                <h2 className="mt-1 text-xl font-medium">{account.name}</h2>
                <p className="text-sm text-muted">
                  {account.institution ?? "No institution"} · {account.transactionCount} transactions
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted">Balance</p>
                  <p className="text-2xl">
                    <MoneyText cents={account.balanceCents} tone={isLiabilityType(account.type) ? "liability" : "default"} />
                  </p>
                </div>
                <AccountActions account={account} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <LedgerMessage error={error} loading={!error} />
      )}
    </div>
  );
}
