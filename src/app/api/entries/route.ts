import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isIsoDate, todayIso } from "@/lib/dates";
import { runAnalysis } from "@/lib/entry-service";

export const maxDuration = 120;

const clampInt = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, user.id))
    .orderBy(desc(entries.entryDate), desc(entries.createdAt));
  return Response.json({ entries: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request." }, { status: 400 });

  const rawSymptoms = Array.isArray(body.symptoms) ? body.symptoms : [];
  const symptoms = rawSymptoms
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return { name: text(o.name, 80), severity: clampInt(o.severity, 1, 10) ?? 5 };
    })
    .filter((s) => s.name)
    .slice(0, 15);
  if (!symptoms.length) {
    return Response.json({ error: "Add at least one symptom." }, { status: 400 });
  }

  const entryDate = isIsoDate(body.entryDate) ? body.entryDate : todayIso();
  const bodyParts = Array.isArray(body.bodyParts)
    ? body.bodyParts.map((b) => text(b, 40)).filter(Boolean).slice(0, 25)
    : [];
  const sleepHoursRaw = Number(body.sleepHours);
  const sleepHours = Number.isFinite(sleepHoursRaw) ? Math.min(24, Math.max(0, sleepHoursRaw)) : 7;

  const [created] = await db
    .insert(entries)
    .values({
      userId: user.id,
      entryDate,
      symptoms,
      bodyParts,
      overallSeverity: Math.max(...symptoms.map((s) => s.severity)),
      mood: clampInt(body.mood, 1, 10) ?? 5,
      sleepHours,
      sleepQuality: clampInt(body.sleepQuality, 1, 10) ?? 5,
      stress: clampInt(body.stress, 1, 10) ?? 5,
      energy: clampInt(body.energy, 1, 10) ?? 5,
      duration: text(body.duration, 200),
      triggers: text(body.triggers, 500),
      medications: text(body.medications, 500),
      notes: text(body.notes, 3000),
    })
    .returning();

  const analyzed = await runAnalysis(created);
  return Response.json({ entry: analyzed });
}
