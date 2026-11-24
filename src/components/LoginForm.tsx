"use client";

import { useState } from "react";

export function LoginForm({ isLocalDemoMode }: { isLocalDemoMode: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Could not send sign-in link.");
        return;
      }
      setStatus("sent");
      setMessage(data.message || "Check your email for the sign-in link.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-zinc-300">
          Work or Indie Builder Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="founder@yourdomain.com"
          className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {status === "loading" ? "Sending Magic Link..." : "Email Me a Sign-In Link"}
      </button>

      {message && (
        <p
          className={`text-xs ${
            status === "error" ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}

      {isLocalDemoMode && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
          Running in local mode (Supabase env vars not set yet). Use the Local Preview button below to test unlocked Pro specs immediately.
        </p>
      )}
    </form>
  );
}
