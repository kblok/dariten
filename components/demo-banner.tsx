"use client";

import { useState } from "react";
import { resetToSeed } from "@/lib/db";

export function DemoBanner() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onReset() {
    if (!window.confirm("Replace this browser's ledger with the original sample household? Edits in this browser will be discarded.")) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await resetToSeed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the sample data.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-forest px-4 py-2 text-center text-sm text-[#f3ecdc]" data-testid="demo-banner">
      <p>
        Local demo — no login. This browser keeps its own sample household. Do not enter real bank data.{" "}
        <button
          type="button"
          onClick={onReset}
          disabled={pending}
          className="underline decoration-[#f3ecdc]/70 underline-offset-2 hover:decoration-[#f3ecdc] disabled:opacity-60"
        >
          {pending ? "Resetting…" : "Reset sample data"}
        </button>
      </p>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
