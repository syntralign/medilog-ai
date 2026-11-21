"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { btnPrimary, btnSecondary, inputCls } from "./ui";

function shift(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BriefGenerator({ today }: { today: string }) {
  const router = useRouter();
  const [start, setStart] = useState(shift(today, -29));
  const [end, setEnd] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function preset(days: number) {
    setEnd(today);
    setStart(shift(today, -(days - 1)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; brief?: { id: string } };
      if (!res.ok || !data.brief) {
        setError(data.error ?? "Could not generate the brief.");
        setLoading(false);
        return;
      }
      router.push(`/briefs/${data.brief.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["Last 7 days", 7],
          ["Last 14 days", 14],
          ["Last 30 days", 30],
          ["Last 90 days", 90],
        ].map(([label, d]) => (
          <button key={label} type="button" onClick={() => preset(d as number)} className={`${btnSecondary} !px-3 !py-1.5 !text-xs`}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start" className="mb-1 block text-sm font-medium text-slate-700">
            From
          </label>
          <input id="start" type="date" required value={start} max={end} onChange={(e) => setStart(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="end" className="mb-1 block text-sm font-medium text-slate-700">
            To
          </label>
          <input id="end" type="date" required value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Writing your brief…" : "Generate Doctor Brief"}
      </button>
      {loading && <p className="text-sm text-slate-500">The AI is reading your entries. This can take up to a minute.</p>}
    </form>
  );
}
