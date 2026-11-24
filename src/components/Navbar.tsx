import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold text-emerald-400 ring-1 ring-emerald-500/30">
            BG
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            BuildGap
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-300 sm:flex">
          <Link href="/" className="transition hover:text-white">
            Idea Feed
          </Link>
          <Link href="/industry/developer-tools" className="transition hover:text-white">
            By Industry
          </Link>
          <Link href="/complaints/evernote" className="transition hover:text-white">
            Product Complaints
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white sm:text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 sm:text-sm"
          >
            Unlock Specs
          </Link>
        </div>
      </div>
    </header>
  );
}
