import Link from "next/link";
import { formatDateOnly, formatMonthLabel } from "@/lib/dates";
import { ACCOUNT_TYPE_LABELS, isLiabilityType } from "@/lib/finance";
import { getDashboardData } from "@/lib/queries";
import { MoneyText } from "@/components/money-text";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const topSpending = data.spending.slice(0, 6);
  const maxSpend = topSpending[0]?.amountCents ?? 1;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{formatMonthLabel(data.month)}</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A snapshot of the shared demo household: net worth, this month&apos;s cash flow, and recent activity.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net worth" hint="All account balances combined">
          <MoneyText cents={data.netWorthCents} />
        </StatCard>
        <StatCard label="Income this month" hint="Inflows across every account">
          <span className="text-moss">
            <MoneyText cents={data.incomeCents} />
          </span>
        </StatCard>
        <StatCard label="Spending this month" hint="Outflows, shown as a positive total">
          <span className="text-coral">
            <MoneyText cents={data.spendingCents} />
          </span>
        </StatCard>
        <StatCard
          label="Savings rate"
          hint="(Income − spending) ÷ income this month. 0% when there is no income."
          preserveCase
        >
          <span className="text-moss">{data.savingsRatePercent}%</span>
        </StatCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-line bg-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Accounts</h2>
            <Link href="/accounts" className="text-sm text-sky hover:underline">
              Manage
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.accounts.map((account) => (
              <article key={account.id} className="rounded-2xl border border-line bg-[#fffaf1] p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{ACCOUNT_TYPE_LABELS[account.type]}</p>
                <h3 className="mt-1 text-lg font-medium">{account.name}</h3>
                <p className="mt-3 text-2xl">
                  <MoneyText cents={account.balanceCents} tone={isLiabilityType(account.type) ? "liability" : "default"} />
                </p>
                {account.institution ? <p className="mt-1 text-xs text-muted">{account.institution}</p> : null}
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Spending snapshot</h2>
            <Link href="/budgets" className="text-sm text-sky hover:underline">
              Budgets
            </Link>
          </div>
          <div className="space-y-4">
            {topSpending.length === 0 ? (
              <p className="text-sm text-muted">No expenses recorded this month.</p>
            ) : (
              topSpending.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.name}</span>
                    <MoneyText cents={item.amountCents} />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efe7d6]">
                    <div className="h-full bg-moss" style={{ width: `${Math.max(8, (item.amountCents / maxSpend) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-panel">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-serif text-2xl">Recent transactions</h2>
          <Link href="/transactions" className="text-sm text-sky hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f2e8] text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Payee</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Account</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.map((transaction) => (
              <tr key={transaction.id} className="border-t border-line">
                <td className="px-6 py-3 text-muted">{formatDateOnly(transaction.date)}</td>
                <td className="px-6 py-3 font-medium">{transaction.payee}</td>
                <td className="px-6 py-3">{transaction.categoryName}</td>
                <td className="px-6 py-3">{transaction.accountName}</td>
                <td className="px-6 py-3 text-right">
                  <MoneyText cents={transaction.amountCents} tone="signed" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({
  label,
  hint,
  children,
  preserveCase = false,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
  preserveCase?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-line bg-panel p-6">
      <p className={`text-xs tracking-[0.18em] text-muted ${preserveCase ? "font-semibold" : "uppercase"}`}>{label}</p>
      <p className="mt-3 font-serif text-4xl">{children}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </article>
  );
}
