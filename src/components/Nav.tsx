"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/entries", label: "Journal" },
  { href: "/briefs", label: "Doctor Briefs" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      </span>
      MediLog
    </span>
  );
}

export function Nav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/entries/new"
            className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            + Log symptoms
          </Link>
          <span className="hidden text-sm text-slate-500 md:inline">{name}</span>
          <button onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
