"use client";

import { liveQuery } from "dexie";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ensureSeeded, loadSnapshot } from "@/lib/db";
import type { LedgerSnapshot } from "@/lib/models";

type LedgerContextValue = {
  snapshot: LedgerSnapshot | null;
  error: string | null;
};

const LedgerContext = createContext<LedgerContextValue>({ snapshot: null, error: null });

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<LedgerSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    ensureSeeded()
      .then(() => {
        if (cancelled) {
          return;
        }
        const subscription = liveQuery(() => loadSnapshot()).subscribe({
          next: (value) => {
            setSnapshot(value);
            setError(null);
          },
          error: (err: unknown) => {
            setError(err instanceof Error ? err.message : "Could not read the local ledger.");
          },
        });
        unsubscribe = () => subscription.unsubscribe();
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not open the local ledger.");
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ snapshot, error }), [snapshot, error]);
  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  return useContext(LedgerContext);
}

export function LedgerMessage({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) {
    return (
      <p className="text-sm text-coral" role="alert">
        {error}
      </p>
    );
  }
  if (loading) {
    return <p className="text-muted">Loading the ledger…</p>;
  }
  return null;
}
