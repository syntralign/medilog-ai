"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({
  url,
  redirectTo,
  confirmText,
  label = "Delete",
}: {
  url: string;
  redirectTo?: string;
  confirmText: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    await fetch(url, { method: "DELETE" }).catch(() => null);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="text-xs font-medium text-red-700 underline-offset-2 hover:underline disabled:opacity-60"
    >
      {loading ? "Deleting…" : label}
    </button>
  );
}
