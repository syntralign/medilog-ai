import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { briefs, entries } from "@/db/schema";
import { AiError, generateBrief } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { diffDays, isIsoDate } from "@/lib/dates";
import { computeStats } from "@/lib/stats";

export const maxDuration = 180;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { start?: string; end?: string } | null;
  if (!body || !isIsoDate(body.start) || !isIsoDate(body.end)) {
    return Response.json({ error: "Please choose a valid date range." }, { status: 400 });
  }
  if (body.start > body.end) {
    return Response.json({ error: "The start date must be before the end date." }, { status: 400 });
  }
  if (diffDays(body.start, body.end) > 366) {
    return Response.json({ error: "Please choose a range of one year or less." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(entries)
    .where(
      and(eq(entries.userId, user.id), gte(entries.entryDate, body.start), lte(entries.entryDate, body.end)),
    )
    .orderBy(asc(entries.entryDate), asc(entries.createdAt));

  if (!rows.length) {
    return Response.json({ error: "There are no entries in that date range." }, { status: 400 });
  }

  const stats = computeStats(rows);
  // Keep the prompt bounded: use the most recent 150 entries for narrative detail.
  const forPrompt = rows.length > 150 ? rows.slice(-150) : rows;

  try {
    const content = await generateBrief(forPrompt, stats, { start: body.start, end: body.end }, user.name);
    const [brief] = await db
      .insert(briefs)
      .values({
        userId: user.id,
        startDate: body.start,
        endDate: body.end,
        entryCount: rows.length,
        content,
        stats,
      })
      .returning();
    return Response.json({ brief });
  } catch (err) {
    const status = err instanceof AiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Could not generate the brief.";
    return Response.json({ error: message }, { status });
  }
}
