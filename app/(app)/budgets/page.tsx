import Link from "next/link";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/dates";
import { getBudgetView } from "@/lib/queries";
import { BudgetEditor } from "@/components/budget-editor";
import { MoneyText } from "@/components/money-text";

export default async function BudgetsPage({ searchParams }: PageProps<"/budgets">) {
  const params = await searchParams;
  const month = typeof params.month === "string" ? params.month : currentMonth();
  const data = await getBudgetView(month);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Budgets</h1>
          <p className="mt-2 text-muted">Simple monthly targets versus actual spending by category.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/budgets?month=${shiftMonth(month, -1)}`} className="btn btn-ghost">
            Previous
          </Link>
          <p className="min-w-40 text-center font-medium">{formatMonthLabel(month)}</p>
          <Link href={`/budgets?month=${shiftMonth(month, 1)}`} className="btn btn-ghost">
            Next
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Budgeted</p>
          <p className="mt-3 font-serif text-4xl">
            <MoneyText cents={data.budgetedCents} />
          </p>
        </article>
        <article className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Spent</p>
          <p className="mt-3 font-serif text-4xl">
            <MoneyText cents={data.actualCents} />
          </p>
        </article>
      </section>

      <BudgetEditor month={month} rows={data.rows} />
    </div>
  );
}
