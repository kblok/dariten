"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, deleteTransaction, updateTransaction } from "@/app/actions/transactions";
import { centsToDollarInput } from "@/lib/money";
import { Modal } from "@/components/modal";
import type { AccountOption, CategoryOption, TransactionDraft } from "@/lib/types";

export function TransactionActions({
  accounts,
  categories,
  transaction,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
  transaction?: TransactionDraft;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const defaultFlow = transaction && transaction.amountCents >= 0 ? "in" : "out";

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      date: String(formData.get("date") ?? ""),
      payee: String(formData.get("payee") ?? ""),
      accountId: String(formData.get("accountId") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      flow: String(formData.get("flow") ?? "out"),
      memo: String(formData.get("memo") ?? ""),
    };
    const result = transaction?.id
      ? await updateTransaction(transaction.id, payload)
      : await createTransaction(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function onDelete() {
    if (!transaction?.id || !window.confirm("Delete this transaction?")) {
      return;
    }
    const result = await deleteTransaction(transaction.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={transaction ? "btn btn-ghost" : "btn btn-primary"} onClick={() => setOpen(true)}>
        {transaction ? "Edit" : "Add transaction"}
      </button>
      <Modal title={transaction ? "Edit transaction" : "New transaction"} open={open} onClose={() => setOpen(false)}>
        <form action={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" defaultValue={transaction?.date} required />
            </div>
            <div className="field">
              <label htmlFor="flow">Type</label>
              <select id="flow" name="flow" defaultValue={defaultFlow}>
                <option value="out">Expense</option>
                <option value="in">Income</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="payee">Payee</label>
            <input id="payee" name="payee" defaultValue={transaction?.payee} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                defaultValue={transaction ? centsToDollarInput(Math.abs(transaction.amountCents)) : ""}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="accountId">Account</label>
              <select id="accountId" name="accountId" defaultValue={transaction?.accountId ?? accounts[0]?.id}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" defaultValue={transaction?.categoryId ?? categories[0]?.id}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.group} · {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="memo">Memo</label>
            <input id="memo" name="memo" defaultValue={transaction?.memo ?? ""} />
          </div>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save transaction"}
            </button>
            {transaction?.id ? (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                Delete
              </button>
            ) : null}
          </div>
        </form>
      </Modal>
    </>
  );
}
