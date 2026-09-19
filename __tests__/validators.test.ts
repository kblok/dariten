import { describe, expect, it } from "vitest";
import { parseAccountInput, parseTransactionInput } from "@/lib/validators";

describe("input validators", () => {
  it("parses a checking account", () => {
    expect(
      parseAccountInput({
        name: "Everyday Checking",
        type: "CHECKING",
        institution: "Harbor Credit Union",
        openingBalance: "3250.00",
      }),
    ).toMatchObject({
      name: "Everyday Checking",
      type: "CHECKING",
      openingBalanceCents: 325000,
    });
  });

  it("stores expenses as negative cents", () => {
    const parsed = parseTransactionInput({
      date: "2026-09-19",
      payee: "Farmers Market",
      accountId: "acct_1",
      categoryId: "cat_1",
      amount: "34.00",
      flow: "out",
      memo: "",
    });

    expect(parsed.amountCents).toBe(-3400);
    expect(parsed.date.toISOString()).toBe("2026-09-19T00:00:00.000Z");
  });
});
