import Link from "next/link";
import type { Entry } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { SeverityPill, UrgencyBadge } from "./ui";

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link
      href={`/entries/${entry.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">
          {formatDate(entry.entryDate, { weekday: "short" })}
        </span>
        <div className="flex items-center gap-2">
          {entry.analysis && <UrgencyBadge urgency={entry.analysis.urgency} />}
          <SeverityPill value={entry.overallSeverity} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {entry.symptoms.map((s, i) => (
          <span key={i} className="rounded-md bg-teal-50 px-2 py-0.5 text-xs text-teal-900">
            {s.name} · {s.severity}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {entry.bodyParts.length > 0 && <>{entry.bodyParts.join(", ")} · </>}
        Sleep {entry.sleepHours}h · Stress {entry.stress}/10 · Energy {entry.energy}/10
      </p>
    </Link>
  );
}
