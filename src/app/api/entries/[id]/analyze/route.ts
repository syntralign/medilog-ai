import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { runAnalysis } from "@/lib/entry-service";

export const maxDuration = 120;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, user.id)))
    .limit(1);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = await runAnalysis(entry);
  if (updated.analysisError) {
    return Response.json({ error: updated.analysisError }, { status: 502 });
  }
  return Response.json({ entry: updated });
}
