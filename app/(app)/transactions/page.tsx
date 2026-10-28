import { TransactionsView } from "@/components/transactions-view";
import type { TransactionFilters } from "@/lib/views";

export default async function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  const params = await searchParams;
  const filters: TransactionFilters = {};
  if (typeof params.accountId === "string" && params.accountId) {
    filters.accountId = params.accountId;
  }
  if (typeof params.categoryId === "string" && params.categoryId) {
    filters.categoryId = params.categoryId;
  }
  if (typeof params.from === "string" && params.from) {
    filters.from = params.from;
  }
  if (typeof params.to === "string" && params.to) {
    filters.to = params.to;
  }

  return <TransactionsView filters={filters} />;
}
