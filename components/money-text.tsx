import { formatCents } from "@/lib/money";

export function MoneyText({
  cents,
  tone = "default",
}: {
  cents: number;
  tone?: "default" | "signed" | "liability";
}) {
  const color =
    tone === "signed"
      ? cents < 0
        ? "text-coral"
        : "text-moss"
      : tone === "liability" && cents < 0
        ? "text-coral"
        : "text-ink";

  return <span className={`tabular-nums ${color}`}>{formatCents(cents)}</span>;
}
