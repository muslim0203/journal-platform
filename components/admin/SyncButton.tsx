"use client";

import { useState } from "react";

type SyncState = "idle" | "loading" | "success" | "error";

export function SyncButton() {
  const [state, setState] = useState<SyncState>("idle");
  const [lastCount, setLastCount] = useState<number | null>(null);

  const handleClick = async () => {
    setState("loading");
    setLastCount(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { success: boolean; count?: number };
      if (data.success) {
        setLastCount(typeof data.count === "number" ? data.count : null);
        setState("success");
      } else {
        setState("error");
      }
    } catch (e) {
      console.error("Sync request failed", e);
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {state === "loading" ? "Syncing…" : "🔄 Sync Articles"}
      </button>
      {state === "success" && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Sync completed
          {typeof lastCount === "number" ? ` • ${lastCount} articles updated` : ""}.
        </p>
      )}
      {state === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Sync failed. Please try again.
        </p>
      )}
    </div>
  );
}


