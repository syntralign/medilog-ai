import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { EntryCard } from "@/components/EntryCard";
import { btnPrimary } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, user.id))
    .orderBy(desc(entries.entryDate), desc(entries.createdAt));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-slate-500">{rows.length} {rows.length === 1 ? "entry" : "entries"}</p>
        </div>
        <Link href="/entries/new" className={btnPrimary}>
          + Log symptoms
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No entries yet. Log your first one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
