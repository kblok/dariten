import { BudgetsView } from "@/components/budgets-view";
import { currentMonth } from "@/lib/dates";

export default async function BudgetsPage({ searchParams }: PageProps<"/budgets">) {
  const params = await searchParams;
  const requested = typeof params.month === "string" ? params.month : "";
  const month = /^\d{4}-\d{2}$/.test(requested) ? requested : currentMonth();
  return <BudgetsView month={month} />;
}
