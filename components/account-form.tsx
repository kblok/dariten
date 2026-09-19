"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount, deleteAccount, updateAccount } from "@/app/actions/accounts";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPES } from "@/lib/finance";
import { centsToDollarInput } from "@/lib/money";
import { Modal } from "@/components/modal";

type AccountRecord = {
  id: string;
  name: string;
  type: (typeof ACCOUNT_TYPES)[number];
  institution: string | null;
  openingBalanceCents: number;
  transactionCount: number;
};

export function AccountActions({ account }: { account?: AccountRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      openingBalance: String(formData.get("openingBalance") ?? ""),
    };
    const result = account ? await updateAccount(account.id, payload) : await createAccount(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function onDelete() {
    if (!account || !window.confirm(`Delete ${account.name}?`)) {
      return;
    }
    const result = await deleteAccount(account.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" className={account ? "btn btn-ghost" : "btn btn-primary"} onClick={() => setOpen(true)}>
        {account ? "Edit" : "Add account"}
      </button>
      <Modal title={account ? "Edit account" : "New account"} open={open} onClose={() => setOpen(false)}>
        <form action={onSubmit} className="grid gap-4">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={account?.name} required />
          </div>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" defaultValue={account?.type ?? "CHECKING"}>
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="institution">Institution</label>
            <input id="institution" name="institution" defaultValue={account?.institution ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="openingBalance">Opening balance</label>
            <input
              id="openingBalance"
              name="openingBalance"
              defaultValue={account ? centsToDollarInput(account.openingBalanceCents) : "0.00"}
              required
            />
            <p className="text-xs text-muted">Credit cards can start negative if you already owe a balance.</p>
          </div>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save account"}
            </button>
            {account ? (
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
