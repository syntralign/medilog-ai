"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnSecondary } from "./ui";

export function RetryAnalysis({
  entryId,
  label = "Run AI analysis",
  subtle = false,
}: {
  entryId: string;
  label?: string;
  subtle?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/entries/${entryId}/analyze`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Analysis failed.");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={run}
        disabled={loading}
        className={
          subtle
            ? "text-xs font-medium text-teal-700 underline-offset-2 hover:underline disabled:opacity-60"
            : btnSecondary
        }
      >
        {loading ? "Analyzing…" : label}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
