import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { AnalysisCard } from "@/components/AnalysisCard";
import { DeleteButton } from "@/components/DeleteButton";
import { Card, SeverityPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default async function EntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { new: isNew } = await searchParams;
  if (!UUID.test(id)) notFound();
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, user.id)))
    .limit(1);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/entries" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to journal
      </Link>
      {isNew && (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          ✓ Entry saved.{" "}
          {entry.analysis ? "Here is what the AI noticed." : "AI analysis wasn't available — details below."}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{formatDate(entry.entryDate, { weekday: "long" })}</h1>
        <DeleteButton
          url={`/api/entries/${entry.id}`}
          redirectTo="/entries"
          confirmText="Delete this entry? This cannot be undone."
          label="Delete entry"
        />
      </div>

      <Card title="AI analysis">
        <AnalysisCard entry={entry} />
      </Card>

      <Card title="Entry details">
        <div className="space-y-4">
          <div>
            <dt className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Symptoms</dt>
            <ul className="space-y-1.5">
              {entry.symptoms.map((s, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <SeverityPill value={s.severity} />
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Body parts" value={entry.bodyParts.join(", ")} />
            <Field label="Duration" value={entry.duration} />
            <Field label="Possible triggers" value={entry.triggers} />
            <Field label="Medications" value={entry.medications} />
          </dl>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["Mood", `${entry.mood}/10`],
              ["Energy", `${entry.energy}/10`],
              ["Stress", `${entry.stress}/10`],
              ["Sleep", `${entry.sleepHours} h`],
              ["Sleep quality", `${entry.sleepQuality}/10`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-200 px-3 py-2">
                <div className="text-xs text-slate-500">{k}</div>
                <div className="text-sm font-semibold">{v}</div>
              </div>
            ))}
          </div>
          <Field label="Notes" value={entry.notes} />
        </div>
      </Card>
    </div>
  );
}
