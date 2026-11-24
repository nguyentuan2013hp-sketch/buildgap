import type { Metadata } from "next";
import Link from "next/link";
import { DemoProToggle } from "@/components/DemoProToggle";
import { LoginForm } from "@/components/LoginForm";
import { getSessionEntitlement } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to BuildGap with a passwordless magic link to access your unlocked AI Build Specs.",
};

export default async function LoginPage() {
  const session = await getSessionEntitlement();

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-7">
        <h1 className="text-2xl font-bold text-white">Sign in to BuildGap</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Use the same email you used at checkout. No password required—we send a one-click sign-in link.
        </p>

        <div className="mt-6">
          <LoginForm isLocalDemoMode={session.isLocalDemoMode} />
        </div>

        {session.isLocalDemoMode && (
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <DemoProToggle isPro={session.isPro} />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-400">
        Need access?{" "}
        <Link href="/pricing" className="text-emerald-400 hover:underline">
          View Lifetime & Pro plans →
        </Link>
      </p>
    </div>
  );
}
