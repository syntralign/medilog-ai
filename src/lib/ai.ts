import type { Entry } from "@/db/schema";
import {
  URGENCY_LEVELS,
  type BriefContent,
  type BriefStats,
  type EntryAnalysis,
  type Urgency,
} from "./types";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

async function chatJSON(system: string, user: string): Promise<Record<string, unknown>> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new AiError(
      "OpenAI is not configured. Add OPENAI_API_KEY to the environment to enable AI features.",
      503,
    );
  }
  let res: Response;
  try {
    res = await fetch("https://api." + "://groq.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new AiError("Could not reach the OpenAI API. Please try again.");
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body.error?.message ?? "";
    } catch {}
    throw new AiError(`OpenAI request failed (${res.status}). ${detail}`.trim());
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new AiError("OpenAI returned an empty response.");
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new AiError("OpenAI returned a response that could not be read.");
  }
}

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v.trim() : fallback);
const strList = (v: unknown, max = 12): string[] =>
  Array.isArray(v)
    ? v
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean)
        .slice(0, max)
    : [];

const SAFETY_RULES = `
Hard rules:
- You are NOT a doctor. NEVER diagnose, never name a condition as the likely cause, never say the user "has" or "probably has" a disease, and never recommend or adjust medication doses.
- Describe patterns and correlations in neutral, observational language ("headaches were logged on 5 of 7 days, often after nights with under 6 hours of sleep").
- Only use information in the data provided. Do not invent entries, dates, or numbers.
- Questions should be practical things a patient could ask a clinician (tests to consider, whether a pattern is worth investigating, when to seek care).
- Be calm, clear, and non-alarming, but do not understate red-flag symptoms.
- Respond with a single valid JSON object only.`;

function describeEntry(e: Entry): string {
  const symptoms = e.symptoms.map((s) => `${s.name} (${s.severity}/10)`).join(", ");
  return [
    `Date: ${e.entryDate}`,
    `Symptoms: ${symptoms}`,
    e.bodyParts.length ? `Body areas: ${e.bodyParts.join(", ")}` : "",
    `Mood ${e.mood}/10, Energy ${e.energy}/10, Stress ${e.stress}/10, Sleep ${e.sleepHours}h (quality ${e.sleepQuality}/10)`,
    e.duration ? `Duration: ${e.duration}` : "",
    e.triggers ? `Possible triggers: ${e.triggers}` : "",
    e.medications ? `Medications/supplements taken: ${e.medications}` : "",
    e.notes ? `Notes: ${e.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeUrgency(v: unknown): Urgency {
  const s = str(v).toLowerCase() as Urgency;
  return URGENCY_LEVELS.includes(s) ? s : "monitor";
}

export async function analyzeEntry(current: Entry, recent: Entry[]): Promise<EntryAnalysis> {
  const system = `You are the analysis engine of MediLog, a personal symptom journal. You review a user's newest symptom entry alongside their recent history and produce: a brief summary, observed patterns, an urgency flag, and questions to ask their doctor.
${SAFETY_RULES}

Urgency levels:
- "routine": mild or stable symptoms, no concerning features; mention at a regular check-up.
- "monitor": noticeable or recurring symptoms worth tracking and raising at an upcoming appointment.
- "urgent": significant, worsening, or persistent symptoms; suggest contacting a healthcare provider promptly (within a day or two).
- "emergency": possible red-flag symptoms (e.g. severe chest pain, trouble breathing, stroke-like signs, severe sudden headache, fainting, suicidal thoughts, very high severity with alarming features); advise seeking emergency care immediately.
When unsure between two levels, choose the more cautious one.

JSON schema:
{
  "summary": string (2-3 sentences about the newest entry in context),
  "patterns": string[] (0-5 observed patterns across the entries; empty if there is not enough data - say so in summary),
  "urgency": "routine" | "monitor" | "urgent" | "emergency",
  "urgencyReason": string (1-2 sentences explaining the flag),
  "questions": string[] (3-5 questions to ask a doctor)
}`;

  const history = recent.length
    ? recent.map(describeEntry).join("\n---\n")
    : "(no earlier entries)";
  const user = `NEWEST ENTRY:\n${describeEntry(current)}\n\nRECENT HISTORY (most recent first, up to 14 entries):\n${history}`;

  const out = await chatJSON(system, user);
  return {
    summary: str(out.summary, "No summary available."),
    patterns: strList(out.patterns, 6),
    urgency: normalizeUrgency(out.urgency),
    urgencyReason: str(out.urgencyReason),
    questions: strList(out.questions, 6),
    generatedAt: new Date().toISOString(),
  };
}

export async function generateBrief(
  entries: Entry[],
  stats: BriefStats,
  range: { start: string; end: string },
  patientName: string,
): Promise<BriefContent> {
  const system = `You write "Doctor Briefs" for MediLog: professional, structured symptom summaries that a patient brings to a medical appointment. Write in a neutral, clinical-but-plain tone, in the third person about the patient's *reported* symptoms ("Patient reports...").
${SAFETY_RULES}

JSON schema:
{
  "title": string,
  "overview": string (one paragraph, 3-5 sentences: what was reported, over what period, how severity changed),
  "timeline": [{ "period": string (a date or date span such as "Mar 3 - Mar 5"), "description": string (what was reported, severity, notable context), "peakSeverity": number | null }] (chronological, group similar adjacent days, at most 12 items),
  "symptomSummary": [{ "symptom": string, "frequency": string (e.g. "6 of 10 entries"), "severityRange": string (e.g. "3-7/10"), "bodyAreas": string }],
  "patterns": string[] (observed patterns: timing, recurrence, worsening/improving, duration, triggers reported),
  "lifestyleCorrelations": string[] (observed associations between symptoms and sleep, stress, energy, mood, and reported triggers; phrase as associations, never causation),
  "medications": string[] (medications/supplements the patient reported and any noted effect on symptoms; empty if none),
  "urgencyNote": string (one or two sentences noting any entries/features that may warrant prompt attention, or that none were apparent in the logged data),
  "questions": string[] (6-10 specific questions the patient could ask the doctor)
}`;

  const lines = entries.map(describeEntry).join("\n---\n");
  const user = `Patient: ${patientName || "Patient"}
Period: ${range.start} to ${range.end}
Number of entries: ${stats.entryCount}
Computed statistics (accurate): ${JSON.stringify(stats)}

ENTRIES (chronological):
${lines}`;

  const out = await chatJSON(system, user);

  const timeline = Array.isArray(out.timeline) ? out.timeline : [];
  const symptomSummary = Array.isArray(out.symptomSummary) ? out.symptomSummary : [];
  return {
    title: str(out.title, `Symptom Summary: ${range.start} to ${range.end}`),
    overview: str(out.overview),
    timeline: timeline.slice(0, 15).map((t) => {
      const o = (t ?? {}) as Record<string, unknown>;
      const peak = typeof o.peakSeverity === "number" ? Math.round(o.peakSeverity) : null;
      return { period: str(o.period), description: str(o.description), peakSeverity: peak };
    }),
    symptomSummary: symptomSummary.slice(0, 15).map((t) => {
      const o = (t ?? {}) as Record<string, unknown>;
      return {
        symptom: str(o.symptom),
        frequency: str(o.frequency),
        severityRange: str(o.severityRange),
        bodyAreas: str(o.bodyAreas),
      };
    }),
    patterns: strList(out.patterns, 12),
    lifestyleCorrelations: strList(out.lifestyleCorrelations, 12),
    medications: strList(out.medications, 12),
    urgencyNote: str(out.urgencyNote),
    questions: strList(out.questions, 12),
    generatedAt: new Date().toISOString(),
  };
}
