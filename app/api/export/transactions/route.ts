import { NextRequest } from "next/server";
import { getTransactions } from "@/lib/queries";
import { transactionsToCsv } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rows = await getTransactions({
    accountId: searchParams.get("accountId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const csv = transactionsToCsv(
    rows.map((row) => ({
      date: row.date,
      payee: row.payee,
      category: row.categoryName,
      account: row.accountName,
      amountCents: row.amountCents,
      memo: row.memo ?? "",
    })),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transactions.csv"',
    },
  });
}
