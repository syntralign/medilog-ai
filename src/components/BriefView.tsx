import type { Brief } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { Disclaimer, SeverityPill } from "./ui";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid-page">
      <h2 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-800">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  );
}

export function BriefView({ brief, patientName }: { brief: Brief; patientName: string }) {
  const c = brief.content;
  const s = brief.stats;
  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="border-b-2 border-teal-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">MediLog · Doctor Brief</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{c.title}</h1>
        <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <dt className="inline font-semibold">Patient: </dt>
            <dd className="inline">{patientName || "—"}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Period: </dt>
            <dd className="inline">
              {formatDate(brief.startDate)} – {formatDate(brief.endDate)}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Entries: </dt>
            <dd className="inline">{brief.entryCount}</dd>
          </div>
        </dl>
      </header>

      <Block title="Overview">
        <p className="text-sm leading-relaxed text-slate-800">{c.overview}</p>
      </Block>

      <Block title="At a glance">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Avg severity", `${s.avgSeverity}/10`],
            ["Peak severity", `${s.peakSeverity}/10${s.peakDate ? ` · ${formatDate(s.peakDate, { year: undefined })}` : ""}`],
            ["Avg sleep", `${s.avgSleep} h`],
            ["Avg stress", `${s.avgStress}/10`],
            ["Avg mood", `${s.avgMood}/10`],
            ["Avg energy", `${s.avgEnergy}/10`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="text-xs text-slate-500">{k}</div>
              <div className="text-sm font-semibold text-slate-900">{v}</div>
            </div>
          ))}
        </div>
      </Block>

      {c.symptomSummary.length > 0 && (
        <Block title="Symptom summary">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-slate-500">
                  <th className="py-1 pr-3 font-semibold">Symptom</th>
                  <th className="py-1 pr-3 font-semibold">Frequency</th>
                  <th className="py-1 pr-3 font-semibold">Severity</th>
                  <th className="py-1 font-semibold">Areas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {c.symptomSummary.map((x, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-3 font-medium capitalize text-slate-900">{x.symptom}</td>
                    <td className="py-1.5 pr-3 text-slate-700">{x.frequency}</td>
                    <td className="py-1.5 pr-3 text-slate-700">{x.severityRange}</td>
                    <td className="py-1.5 text-slate-700">{x.bodyAreas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      )}

      {c.timeline.length > 0 && (
        <Block title="Symptom timeline">
          <ol className="space-y-3 border-l-2 border-teal-200 pl-4">
            {c.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600" />
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  {t.period}
                  {t.peakSeverity ? <SeverityPill value={t.peakSeverity} /> : null}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{t.description}</p>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {c.patterns.length > 0 && (
        <Block title="Pattern analysis">
          <Bullets items={c.patterns} />
        </Block>
      )}
      {c.lifestyleCorrelations.length > 0 && (
        <Block title="Lifestyle correlations">
          <Bullets items={c.lifestyleCorrelations} />
        </Block>
      )}
      {c.medications.length > 0 && (
        <Block title="Medications / supplements reported">
          <Bullets items={c.medications} />
        </Block>
      )}
      {c.urgencyNote && (
        <Block title="Items that may warrant attention">
          <p className="text-sm leading-relaxed text-slate-800">{c.urgencyNote}</p>
        </Block>
      )}
      {c.questions.length > 0 && (
        <Block title="Suggested questions for the doctor">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-800">
            {c.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </Block>
      )}

      <Disclaimer />
      <p className="text-xs text-slate-400">
        Generated by MediLog on {formatDate(brief.createdAt.toISOString().slice(0, 10))} from patient-reported entries.
      </p>
    </article>
  );
}
