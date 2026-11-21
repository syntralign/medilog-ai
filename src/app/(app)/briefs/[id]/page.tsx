import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { briefs } from "@/db/schema";
import { BriefActions } from "@/components/BriefActions";
import { BriefView } from "@/components/BriefView";
import { requireUser } from "@/lib/auth";
import { briefToText } from "@/lib/brief-text";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [brief] = await db
    .select()
    .from(briefs)
    .where(and(eq(briefs.id, id), eq(briefs.userId, user.id)))
    .limit(1);
  if (!brief) notFound();

  const name = user.name || user.email;

  return (
    <div className="mx-auto max-w-3xl space-y-4 print:max-w-none">
      <div className="space-y-4 print:hidden">
        <Link href="/briefs" className="text-sm text-slate-500 hover:text-slate-800">
          ← All briefs
        </Link>
        <BriefActions text={briefToText(brief, name)} />
      </div>
      <BriefView brief={brief} patientName={name} />
    </div>
  );
}
