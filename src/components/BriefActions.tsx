"use client";

import { useState } from "react";
import { btnPrimary, btnSecondary } from "./ui";

export function BriefActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button onClick={() => window.print()} className={btnPrimary}>
        Print / Save as PDF
      </button>
      <button onClick={copy} className={btnSecondary}>
        {copied ? "Copied ✓" : "Copy as text"}
      </button>
    </div>
  );
}
