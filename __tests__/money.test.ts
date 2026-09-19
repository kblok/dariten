import { describe, expect, it } from "vitest";
import { accountBalanceCents, centsToDollarInput, dollarsToCents, formatCents, netWorthCents } from "@/lib/money";

describe("money helpers", () => {
  it("converts dollar strings to cents", () => {
    expect(dollarsToCents("42.50")).toBe(4250);
    expect(dollarsToCents("$1,200.05")).toBe(120005);
    expect(dollarsToCents("-18.40")).toBe(-1840);
    expect(dollarsToCents("0")).toBe(0);
  });

  it("rejects invalid amounts", () => {
    expect(() => dollarsToCents("twelve")).toThrow(/valid dollar amount/);
  });

  it("formats cents with a unicode minus", () => {
    expect(formatCents(185000)).toBe("$1,850.00");
    expect(formatCents(-4820)).toBe("−$48.20");
  });

  it("round-trips cents to an input string", () => {
    expect(centsToDollarInput(-112000)).toBe("-1120.00");
    expect(centsToDollarInput(24000)).toBe("240.00");
  });

  it("computes account and net-worth balances", () => {
    expect(accountBalanceCents(325000, [320000, -185000, -9412])).toBe(450588);
    expect(netWorthCents([428015, 1245000, -184233, 18600])).toBe(1507382);
  });
});
