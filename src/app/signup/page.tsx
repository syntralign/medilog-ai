import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
          <p className="mb-5 text-sm text-slate-500">Start tracking your symptoms in minutes.</p>
          <AuthForm mode="signup" />
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          MediLog never diagnoses conditions. It helps you organize information for your doctor.
        </p>
      </div>
    </main>
  );
}
