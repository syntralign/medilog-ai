"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BODY_PARTS, COMMON_TRIGGERS } from "@/lib/types";
import { btnPrimary, btnSecondary, inputCls } from "./ui";

type SymptomRow = { key: number; name: string; severity: number };

function Slider({
  label,
  hint,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-teal-800">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-700"
      />
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{low}</span>
        <span>{hint}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {desc && <p className="mb-4 mt-0.5 text-sm text-slate-500">{desc}</p>}
      {!desc && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function EntryForm({ today }: { today: string }) {
  const router = useRouter();
  const [entryDate, setEntryDate] = useState(today);
  const [symptoms, setSymptoms] = useState<SymptomRow[]>([{ key: 1, name: "", severity: 4 }]);
  const [nextKey, setNextKey] = useState(2);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(4);
  const [sleepHours, setSleepHours] = useState("7");
  const [sleepQuality, setSleepQuality] = useState(6);
  const [duration, setDuration] = useState("");
  const [triggers, setTriggers] = useState("");
  const [medications, setMedications] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  function addTrigger(t: string) {
    const parts = triggers
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.some((p) => p.toLowerCase() === t.toLowerCase())) return;
    setTriggers([...parts, t].join(", "));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const filled = symptoms.filter((s) => s.name.trim());
    if (!filled.length) {
      setError("Please describe at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryDate,
          symptoms: filled.map((s) => ({ name: s.name.trim(), severity: s.severity })),
          bodyParts,
          mood,
          energy,
          stress,
          sleepHours: Number(sleepHours),
          sleepQuality,
          duration,
          triggers,
          medications,
          notes,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; entry?: { id: string } };
      if (!res.ok || !data.entry) {
        setError(data.error ?? "Could not save your entry.");
        setLoading(false);
        return;
      }
      router.push(`/entries/${data.entry.id}?new=1`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="When" desc="Which day are you logging?">
        <input
          type="date"
          value={entryDate}
          max={today}
          required
          onChange={(e) => setEntryDate(e.target.value)}
          className={`${inputCls} max-w-xs`}
          aria-label="Entry date"
        />
      </Section>

      <Section title="Symptoms" desc="What are you experiencing, and how severe is each one? (1 = barely noticeable, 10 = worst imaginable)">
        <div className="space-y-4">
          {symptoms.map((s, i) => (
            <div key={s.key} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={s.name}
                  onChange={(e) =>
                    setSymptoms((rows) => rows.map((r) => (r.key === s.key ? { ...r, name: e.target.value } : r)))
                  }
                  placeholder={i === 0 ? "e.g. Headache, nausea, joint pain" : "Another symptom"}
                  className={inputCls}
                  aria-label={`Symptom ${i + 1}`}
                  maxLength={80}
                />
                {symptoms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSymptoms((rows) => rows.filter((r) => r.key !== s.key))}
                    className="rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-200"
                    aria-label="Remove symptom"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-3">
                <Slider
                  label="Severity"
                  value={s.severity}
                  low="Mild"
                  high="Severe"
                  onChange={(v) =>
                    setSymptoms((rows) => rows.map((r) => (r.key === s.key ? { ...r, severity: v } : r)))
                  }
                />
              </div>
            </div>
          ))}
          {symptoms.length < 15 && (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setSymptoms((rows) => [...rows, { key: nextKey, name: "", severity: 4 }]);
                setNextKey((k) => k + 1);
              }}
            >
              + Add another symptom
            </button>
          )}
        </div>
      </Section>

      <Section title="Body parts affected" desc="Select all that apply.">
        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((p) => {
            const on = bodyParts.includes(p);
            return (
              <button
                type="button"
                key={p}
                aria-pressed={on}
                onClick={() => setBodyParts((l) => toggle(l, p))}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  on
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Mood, energy & stress" desc="How are you doing overall today?">
        <div className="grid gap-5 sm:grid-cols-3">
          <Slider label="Mood" value={mood} onChange={setMood} low="Low" high="Great" />
          <Slider label="Energy" value={energy} onChange={setEnergy} low="Drained" high="Energized" />
          <Slider label="Stress" value={stress} onChange={setStress} low="Calm" high="Very stressed" />
        </div>
      </Section>

      <Section title="Sleep" desc="Last night's sleep.">
        <div className="grid items-end gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sleepHours" className="mb-1 block text-sm font-medium text-slate-700">
              Hours slept
            </label>
            <input
              id="sleepHours"
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className={`${inputCls} max-w-[10rem]`}
            />
          </div>
          <Slider label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} low="Poor" high="Restful" />
        </div>
      </Section>

      <Section title="Details" desc="Optional, but the more context you give, the more useful your doctor brief will be.">
        <div className="space-y-4">
          <div>
            <label htmlFor="duration" className="mb-1 block text-sm font-medium text-slate-700">
              How long did symptoms last?
            </label>
            <input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2 hours in the afternoon, all day, on and off"
              className={inputCls}
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="triggers" className="mb-1 block text-sm font-medium text-slate-700">
              Possible triggers
            </label>
            <input
              id="triggers"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="Anything you think might have set it off"
              className={inputCls}
              maxLength={500}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMMON_TRIGGERS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => addTrigger(t)}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="meds" className="mb-1 block text-sm font-medium text-slate-700">
              Medications or supplements taken
            </label>
            <input
              id="meds"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Ibuprofen 400mg at 2pm - eased headache after an hour"
              className={inputCls}
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Anything else worth remembering - food, activity, what made it better or worse…"
              className={inputCls}
              maxLength={3000}
            />
          </div>
        </div>
      </Section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Saving & analyzing…" : "Save entry & analyze"}
        </button>
        {loading && (
          <span className="text-sm text-slate-500">This can take a few seconds while the AI reviews your recent entries.</span>
        )}
      </div>
    </form>
  );
}
