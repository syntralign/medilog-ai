import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { entries, type Entry } from "@/db/schema";
import { analyzeEntry } from "./ai";

/** Runs AI analysis for an entry and stores the result (or the error). Never throws. */
export async function runAnalysis(entry: Entry): Promise<Entry> {
  try {
    const recent = await db
      .select()
      .from(entries)
      .where(and(eq(entries.userId, entry.userId), ne(entries.id, entry.id)))
      .orderBy(desc(entries.entryDate), desc(entries.createdAt))
      .limit(14);
    // only consider entries on/before this one's date
    const history = recent.filter((r) => r.entryDate <= entry.entryDate);
    const analysis = await analyzeEntry(entry, history);
    const [updated] = await db
      .update(entries)
      .set({ analysis, analysisError: null })
      .where(eq(entries.id, entry.id))
      .returning();
    return updated;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    const [updated] = await db
      .update(entries)
      .set({ analysisError: message })
      .where(eq(entries.id, entry.id))
      .returning();
    return updated;
  }
}

