import type { Entry } from "@/db/schema";
import type { BriefStats } from "./types";

const avg = (nums: number[]) =>
  nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;

export function computeStats(entries: Entry[]): BriefStats {
  const counts = new Map<string, { count: number; total: number }>();
  for (const e of entries) {
    for (const s of e.symptoms) {
      const key = s.name.trim().toLowerCase();
      if (!key) continue;
      const cur = counts.get(key) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += s.severity;
      counts.set(key, cur);
    }
  }
  const topSymptoms = [...counts.entries()]
    .map(([name, v]) => ({
      name,
      count: v.count,
      avgSeverity: Math.round((v.total / v.count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count || b.avgSeverity - a.avgSeverity)
    .slice(0, 8);

  let peak = 0;
  let peakDate: string | null = null;
  for (const e of entries) {
    if (e.overallSeverity > peak) {
      peak = e.overallSeverity;
      peakDate = e.entryDate;
    }
  }

  return {
    entryCount: entries.length,
    avgSeverity: avg(entries.map((e) => e.overallSeverity)),
    peakSeverity: peak,
    peakDate,
    avgSleep: avg(entries.map((e) => e.sleepHours)),
    avgMood: avg(entries.map((e) => e.mood)),
    avgStress: avg(entries.map((e) => e.stress)),
    avgEnergy: avg(entries.map((e) => e.energy)),
    topSymptoms,
  };
}

/** Compare average severity of the latest 7 days to the 7 days before it. */
export function severityTrend(entries: Entry[], endIso: string) {
  const end = new Date(`${endIso}T00:00:00Z`).getTime();
  const day = 86400000;
  const recent: number[] = [];
  const prior: number[] = [];
  for (const e of entries) {
    const age = Math.floor((end - new Date(`${e.entryDate}T00:00:00Z`).getTime()) / day);
    if (age < 0) continue;
    if (age < 7) recent.push(e.overallSeverity);
    else if (age < 14) prior.push(e.overallSeverity);
  }
  if (!recent.length) return null;
  const r = avg(recent);
  const p = prior.length ? avg(prior) : null;
  return {
    recentAvg: r,
    priorAvg: p,
    delta: p === null ? null : Math.round((r - p) * 10) / 10,
  };
}
