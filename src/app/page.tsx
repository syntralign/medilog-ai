import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Nav";
import { Disclaimer } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    title: "Log in under a minute",
    body: "Symptoms and severity, body areas, mood, sleep, stress, energy, triggers, medications and notes, all in one simple form.",
  },
  {
    title: "AI pattern spotting",
    body: "After every entry, AI reviews your recent history, flags urgency (routine → emergency), and suggests questions for your doctor.",
  },
  {
    title: "Doctor Brief, ready to print",
    body: "Pick a date range and get a structured summary with a timeline, patterns, lifestyle correlations and questions. Print it or copy it.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pb-12 pt-14 text-center sm:pt-20">
        <p className="mb-4 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800">
          AI symptom journal
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Walk into every appointment <span className="text-teal-700">prepared.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          MediLog helps you track how you feel day to day, notices patterns you might miss, and turns weeks
          of notes into a clear, professional brief for your doctor.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-teal-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800">
            Start your journal — it&apos;s free
          </Link>
          <Link href="/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-12 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <Disclaimer />
      </section>
    </main>
  );
}
