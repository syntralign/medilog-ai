import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { EntryCard } from "@/components/EntryCard";
import { SeverityChart } from "@/components/SeverityChart";
import { Card, Disclaimer, EmergencyBanner, UrgencyBadge, btnPrimary } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { todayIso } from "@/lib/dates";
import { computeStats, severityTrend } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, user.id))
    .orderBy(desc(entries.entryDate), desc(entries.createdAt))
    .limit(120);

  const today = todayIso();
  const endIso = rows.length && rows[0].entryDate > today ? rows[0].entryDate : today;
  const recent = rows.slice(0, 5);
  const latestAnalyzed = rows.find((r) => r.analysis);
  const analysis = latestAnalyzed?.analysis ?? null;
  const trend = severityTrend(rows, endIso);
  const last14 = rows.filter((r) => r.entryDate >= new Date(Date.parse(endIso) - 13 * 86400000).toISOString().slice(0, 10));
  const stats = computeStats(last14);

  if (!rows.length) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-2xl font-bold">Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
        <p className="mt-3 text-slate-600">
          Log your first entry to start building your symptom history. After each entry, MediLog&apos;s AI
          looks for patterns and suggests questions for your doctor.
        </p>
        <Link href="/entries/new" className={`${btnPrimary} mt-6`}>
          Log your first entry
        </Link>
        <Disclaimer className="mt-10 text-left" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Your last 30 days at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/entries/new" className={btnPrimary}>
            + Log symptoms
          </Link>
        </div>
      </div>

      {analysis?.urgency === "emergency" && <EmergencyBanner />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Severity trend">
            <SeverityChart entries={rows} endIso={endIso} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-lg font-bold text-slate-900">{trend ? trend.recentAvg : "—"}</div>
                <div className="text-xs text-slate-500">Avg severity, last 7 days</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-lg font-bold text-slate-900">
                  {trend?.delta == null ? "—" : `${trend.delta > 0 ? "+" : ""}${trend.delta}`}
                </div>
                <div className="text-xs text-slate-500">vs. previous 7 days</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-lg font-bold text-slate-900">{stats.entryCount}</div>
                <div className="text-xs text-slate-500">Entries, last 14 days</div>
              </div>
            </div>
          </Card>

          <Card
            title="Recent entries"
            action={
              <Link href="/entries" className="text-sm font-medium text-teal-700 hover:underline">
                View all
              </Link>
            }
          >
            <div className="space-y-3">
              {recent.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="AI insights">
            {analysis && latestAnalyzed ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <UrgencyBadge urgency={analysis.urgency} />
                  <span className="text-xs text-slate-500">Based on your latest analyzed entry</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-800">{analysis.summary}</p>
                {analysis.patterns.length > 0 && (
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-800">
                    {analysis.patterns.slice(0, 4).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
                <Link href={`/entries/${latestAnalyzed.id}`} className="text-sm font-medium text-teal-700 hover:underline">
                  See full analysis & questions →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No AI insights yet. Insights appear after an entry is analyzed. If analysis was unavailable,
                open an entry and run it again.
              </p>
            )}
            <Disclaimer className="mt-4" />
          </Card>

          {stats.topSymptoms.length > 0 && (
            <Card title="Most logged (14 days)">
              <ul className="space-y-2">
                {stats.topSymptoms.slice(0, 5).map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-800">{s.name}</span>
                    <span className="text-slate-500">
                      {s.count}× · avg {s.avgSeverity}/10
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Heading to the doctor?">
            <p className="mb-3 text-sm text-slate-600">
              Turn your entries into a structured brief you can print or copy.
            </p>
            <Link href="/briefs" className={`${btnPrimary} w-full`}>
              Create a Doctor Brief
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
