import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediLog — AI Symptom Journal & Doctor Brief Generator",
  description:
    "Log your symptoms daily, spot patterns with AI, and generate a professional brief to bring to your doctor.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased print:bg-white">{children}</body>
    </html>
  );
}
