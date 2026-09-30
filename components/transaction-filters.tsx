"use client";

import { useRouter } from "next/navigation";
import type { AccountOption, CategoryOption } from "@/lib/types";

export function TransactionFilters({
  accounts,
  categories,
  current,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
  current: { search?: string; accountId?: string; categoryId?: string; from?: string; to?: string };
}) {
  const router = useRouter();

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["search", "accountId", "categoryId", "from", "to"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.push(query ? `/transactions?${query}` : "/transactions");
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-2xl border border-line bg-panel p-4">
      <div className="field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          name="search"
          type="search"
          placeholder="Search payee or memo"
          defaultValue={current.search ?? ""}
          autoComplete="off"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <div className="field">
          <label htmlFor="accountId">Account</label>
          <select id="accountId" name="accountId" defaultValue={current.accountId ?? ""}>
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={current.categoryId ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={current.from ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={current.to ?? ""} />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-primary w-full">
            Filter
          </button>
        </div>
      </div>
    </form>
  );
}
