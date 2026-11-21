import { EntryForm } from "@/components/EntryForm";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default function NewEntryPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Log symptoms</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">
        After you save, AI will review your recent entries for patterns and suggest questions for your doctor.
      </p>
      <EntryForm today={todayIso()} />
    </div>
  );
}
