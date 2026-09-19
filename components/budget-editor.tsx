"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBudgets } from "@/app/actions/budgets";
import { centsToDollarInput } from "@/lib/money";
import { budgetProgress } from "@/lib/finance";
import { MoneyText } from "@/components/money-text";

type BudgetRow = {
  categoryId: string;
  name: string;
  group: string;
  budgetCents: number;
  actualCents: number;
};

export function BudgetEditor({ month, rows }: { month: string; rows: BudgetRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);
    const items = rows.map((row) => ({
      categoryId: row.categoryId,
      amount: String(formData.get(`budget-${row.categoryId}`) ?? "0"),
    }));
    const result = await saveBudgets({ month, items });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Budget saved.");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="overflow-hidden rounded-3xl border border-line bg-panel">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f7f2e8] text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Budget</th>
            <th className="px-5 py-3 font-medium">Actual</th>
            <th className="px-5 py-3 font-medium">Remaining</th>
            <th className="px-5 py-3 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const progress = budgetProgress(row.budgetCents, row.actualCents);
            return (
              <tr key={row.categoryId} className="border-t border-line">
                <td className="px-5 py-4">
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted">{row.group}</div>
                </td>
                <td className="px-5 py-4">
                  <input
                    name={`budget-${row.categoryId}`}
                    defaultValue={centsToDollarInput(row.budgetCents)}
                    className="w-28 rounded-lg border border-line px-2 py-1"
                  />
                </td>
                <td className="px-5 py-4">
                  <MoneyText cents={row.actualCents} />
                </td>
                <td className="px-5 py-4">
                  <MoneyText cents={progress.remainingCents} tone="signed" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-2 overflow-hidden rounded-full bg-[#efe7d6]">
                    <div
                      className={`h-full ${progress.over ? "bg-coral" : "bg-moss"}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save budgets"}
        </button>
        {error ? <p className="text-sm text-coral">{error}</p> : null}
        {message ? <p className="text-sm text-moss">{message}</p> : null}
      </div>
    </form>
  );
}
