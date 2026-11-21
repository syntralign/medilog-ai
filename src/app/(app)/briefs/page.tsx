import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { BriefGenerator } from "@/components/BriefGenerator";
import { DeleteButton } from "@/components/DeleteButton";
import { Card, Disclaimer } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(briefs)
    .where(eq(briefs.userId, user.id))
    .orderBy(desc(briefs.createdAt));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doctor Briefs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a date range and the AI will read your entries from that period and write a structured
          summary: timeline, patterns, lifestyle correlations and suggested questions.
        </p>
      </div>

      <Card title="Generate a new brief">
        <BriefGenerator today={todayIso()} />
      </Card>

      <Card title="Previous briefs">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t generated any briefs yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {rows.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/briefs/${b.id}`} className="group">
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                    {formatDate(b.startDate)} – {formatDate(b.endDate)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {b.entryCount} entries · created {formatDate(b.createdAt.toISOString().slice(0, 10))}
                  </div>
                </Link>
                <DeleteButton url={`/api/briefs/${b.id}`} confirmText="Delete this brief?" />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Disclaimer />
    </div>
  );
}
