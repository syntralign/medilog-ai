import type { Entry } from "@/db/schema";
import { Disclaimer, EmergencyBanner, UrgencyBadge } from "./ui";
import { RetryAnalysis } from "./RetryAnalysis";

export function AnalysisCard({ entry }: { entry: Entry }) {
  const a = entry.analysis;
  if (!a) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          {entry.analysisError
            ? "AI analysis is not available for this entry yet."
            : "No AI analysis has been generated for this entry."}
        </p>
        {entry.analysisError && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{entry.analysisError}</p>
        )}
        <RetryAnalysis entryId={entry.id} />
        <Disclaimer />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {a.urgency === "emergency" && <EmergencyBanner />}
      <div className="flex flex-wrap items-center gap-2">
        <UrgencyBadge urgency={a.urgency} />
        <span className="text-sm text-slate-600">{a.urgencyReason}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-800">{a.summary}</p>
      {a.patterns.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Patterns noticed
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
            {a.patterns.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {a.questions.length > 0 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Questions to ask your doctor
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-800">
            {a.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <RetryAnalysis entryId={entry.id} label="Re-run analysis" subtle />
      </div>
      <Disclaimer />
    </div>
  );
}
