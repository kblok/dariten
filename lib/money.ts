const DOLLAR_PATTERN = /^-?\d+(\.\d{1,2})?$/;

export function dollarsToCents(input: string): number {
  const normalized = input.trim().replace(/[$,\s]/g, "");
  if (!DOLLAR_PATTERN.test(normalized)) {
    throw new Error("Enter a valid dollar amount, like 42.50");
  }

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole, fraction = ""] = unsigned.split(".");
  const cents = Number.parseInt(whole, 10) * 100 + Number.parseInt(fraction.padEnd(2, "0") || "0", 10);
  return negative ? -cents : cents;
}

export function centsToDollarInput(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const value = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  return negative ? `-${value}` : value;
}

export function formatCents(cents: number): string {
  const absolute = Math.abs(cents) / 100;
  const formatted = absolute.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return cents < 0 ? `−${formatted}` : formatted;
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function accountBalanceCents(openingBalanceCents: number, transactionAmounts: number[]): number {
  return openingBalanceCents + sumCents(transactionAmounts);
}

export function netWorthCents(balances: number[]): number {
  return sumCents(balances);
}
