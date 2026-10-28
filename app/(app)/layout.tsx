import { AppShell } from "@/components/app-shell";
import { LedgerProvider } from "@/components/ledger-provider";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <LedgerProvider>
      <AppShell>{children}</AppShell>
    </LedgerProvider>
  );
}
