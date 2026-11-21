import type { Brief } from "@/db/schema";
import { formatDate } from "./dates";
import { MEDICAL_DISCLAIMER } from "./types";

export function briefToText(brief: Brief, patientName: string): string {
  const c = brief.content;
  const s = brief.stats;
  const L: string[] = [];
  L.push(c.title.toUpperCase());
  L.push(`Patient: ${patientName || "—"}`);
  L.push(`Period: ${formatDate(brief.startDate)} – ${formatDate(brief.endDate)} (${brief.entryCount} entries)`);
  L.push(`Prepared: ${formatDate(brief.createdAt.toISOString().slice(0, 10))}`);
  L.push("");
  L.push("OVERVIEW");
  L.push(c.overview);
  L.push("");
  L.push("AT A GLANCE");
  L.push(
    `Average severity ${s.avgSeverity}/10 · Peak ${s.peakSeverity}/10${s.peakDate ? ` on ${formatDate(s.peakDate)}` : ""}`,
  );
  L.push(
    `Averages: sleep ${s.avgSleep}h · mood ${s.avgMood}/10 · energy ${s.avgEnergy}/10 · stress ${s.avgStress}/10`,
  );
  L.push("");
  if (c.symptomSummary.length) {
    L.push("SYMPTOM SUMMARY");
    for (const x of c.symptomSummary) {
      L.push(`- ${x.symptom}: ${x.frequency}; severity ${x.severityRange}${x.bodyAreas ? `; areas: ${x.bodyAreas}` : ""}`);
    }
    L.push("");
  }
  if (c.timeline.length) {
    L.push("SYMPTOM TIMELINE");
    for (const t of c.timeline) {
      L.push(`- ${t.period}${t.peakSeverity ? ` (peak ${t.peakSeverity}/10)` : ""}: ${t.description}`);
    }
    L.push("");
  }
  const list = (title: string, items: string[]) => {
    if (!items.length) return;
    L.push(title);
    items.forEach((i) => L.push(`- ${i}`));
    L.push("");
  };
  list("PATTERN ANALYSIS", c.patterns);
  list("LIFESTYLE CORRELATIONS", c.lifestyleCorrelations);
  list("MEDICATIONS / SUPPLEMENTS REPORTED", c.medications);
  if (c.urgencyNote) {
    L.push("ITEMS THAT MAY WARRANT ATTENTION");
    L.push(c.urgencyNote);
    L.push("");
  }
  if (c.questions.length) {
    L.push("SUGGESTED QUESTIONS FOR THE DOCTOR");
    c.questions.forEach((q, i) => L.push(`${i + 1}. ${q}`));
    L.push("");
  }
  L.push("DISCLAIMER");
  L.push(MEDICAL_DISCLAIMER);
  return L.join("\n");
}
