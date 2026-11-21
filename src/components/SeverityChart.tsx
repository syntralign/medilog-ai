import type { Entry } from "@/db/schema";
import { addDays, diffDays, formatDate } from "@/lib/dates";

type Point = { date: string; severity: number; stress: number };

export function SeverityChart({ entries, endIso, days = 30 }: { entries: Entry[]; endIso: string; days?: number }) {
  const start = addDays(endIso, -(days - 1));
  const byDay = new Map<string, { sev: number; stress: number[] }>();
  for (const e of entries) {
    if (e.entryDate < start || e.entryDate > endIso) continue;
    const cur = byDay.get(e.entryDate) ?? { sev: 0, stress: [] };
    cur.sev = Math.max(cur.sev, e.overallSeverity);
    cur.stress.push(e.stress);
    byDay.set(e.entryDate, cur);
  }
  const points: Point[] = [...byDay.entries()]
    .map(([date, v]) => ({
      date,
      severity: v.sev,
      stress: v.stress.reduce((a, b) => a + b, 0) / v.stress.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!points.length) {
    return (
      <div className="grid h-48 place-items-center rounded-xl bg-slate-50 text-sm text-slate-500">
        Log a few entries to see your severity trend.
      </div>
    );
  }

  const W = 640;
  const H = 230;
  const pad = { l: 32, r: 12, t: 12, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (date: string) => pad.l + (diffDays(start, date) / (days - 1)) * iw;
  const y = (v: number) => pad.t + ih - ((v - 1) / 9) * ih;

  const line = (key: "severity" | "stress") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

  const area =
    `${line("severity")} L${x(points[points.length - 1].date).toFixed(1)},${pad.t + ih} L${x(points[0].date).toFixed(1)},${pad.t + ih} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => addDays(start, Math.round(f * (days - 1))));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Severity trend over the last 30 days">
        {[1, 3, 5, 7, 10].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">
              {v}
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">
            {formatDate(t, { year: undefined })}
          </text>
        ))}
        <path d={area} fill="#0f766e" opacity="0.08" />
        {points.length > 1 && (
          <path d={line("stress")} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4 3" />
        )}
        {points.length > 1 && <path d={line("severity")} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinejoin="round" />}
        {points.map((p) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.severity)} r="4" fill="#0f766e" stroke="#fff" strokeWidth="1.5">
            <title>{`${formatDate(p.date)}: peak severity ${p.severity}/10, stress ${p.stress.toFixed(1)}/10`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 bg-teal-700" /> Peak symptom severity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 border-t-2 border-dashed border-violet-400" /> Stress level
        </span>
      </div>
    </div>
  );
}
