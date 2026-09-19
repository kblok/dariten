export type ActionResult = { ok: true } | { ok: false; error: string };

export type AccountOption = {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "CASH";
};

export type CategoryOption = {
  id: string;
  name: string;
  group: string;
  isIncome: boolean;
};

export type TransactionDraft = {
  id?: string;
  date: string;
  payee: string;
  accountId: string;
  categoryId: string;
  amountCents: number;
  memo: string | null;
};
