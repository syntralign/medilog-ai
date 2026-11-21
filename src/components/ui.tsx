import type { ReactNode } from "react";
import { MEDICAL_DISCLAIMER, type Urgency } from "@/lib/types";

const URGENCY_STYLES: Record<Urgency, { cls: string; label: string }> = {
  routine: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", label: "Routine" },
  monitor: { cls: "bg-amber-50 text-amber-800 ring-amber-200", label: "Monitor" },
  urgent: { cls: "bg-orange-100 text-orange-900 ring-orange-300", label: "Urgent" },
  emergency: { cls: "bg-red-600 text-white ring-red-700", label: "Emergency" },
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const s = URGENCY_STYLES[urgency];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 ${className}`}
    >
      <strong className="font-semibold text-slate-700">Medical disclaimer: </strong>
      {MEDICAL_DISCLAIMER}
    </p>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SeverityPill({ value }: { value: number }) {
  const cls =
    value >= 8
      ? "bg-red-100 text-red-800"
      : value >= 5
        ? "bg-orange-100 text-orange-800"
        : value >= 3
          ? "bg-amber-100 text-amber-800"
          : "bg-emerald-100 text-emerald-800";
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${cls}`}>
      {value}/10
    </span>
  );
}

export function EmergencyBanner() {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
    >
      This entry was flagged as a possible emergency. If you are experiencing severe or worsening symptoms,
      call your local emergency number or go to the nearest emergency department now. Do not wait to
      discuss this with your doctor later.
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60";
export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";
