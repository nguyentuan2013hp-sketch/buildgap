"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoProToggle({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch("/api/dev/toggle-pro", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-60"
    >
      {busy
        ? "Switching..."
        : isPro
          ? "Local Preview: Pro Unlocked (Switch to Free)"
          : "Local Preview: Free Mode (Test Pro Unlock)"}
    </button>
  );
}
