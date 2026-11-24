import Link from "next/link";
import { IdeaExplorer } from "@/components/IdeaExplorer";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getAllCompetitors, getAllIdeas, getIndustries } from "@/lib/ideas";

export default function HomePage() {
  const ideas = getAllIdeas();
  const industries = getIndustries();
  const competitors = getAllCompetitors();
  const totalEvidence = ideas.reduce((sum, item) => sum + item.evidenceCount, 0);
  const usingSampleOnly = ideas.every((item) => item.isSampleData);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Built for Cursor, Claude Code, Lovable & Bolt Builders
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Stop guessing what to build. Ship software people are already complaining about.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
          BuildGap aggregates real 1–3 star reviews, high-vote GitHub feature requests, and Hacker News tool complaints across industries—then packages each gap with an AI-ready MVP spec, schema, and starter prompt.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#database"
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            Browse Opportunities
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-500"
          >
            Lifetime Access ($49 Early Bird)
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-6 sm:grid-cols-4">
          <div>
            <div className="text-2xl font-bold text-white">{ideas.length}</div>
            <div className="text-xs text-zinc-400">
              {usingSampleOnly ? "Curated Build Gaps (Dev Seed)" : "Verified Build Gaps"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalEvidence}</div>
            <div className="text-xs text-zinc-400">Backed Real Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{industries.length}</div>
            <div className="text-xs text-zinc-400">Industries Tracked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{competitors.length}</div>
            <div className="text-xs text-zinc-400">Competitor Gap Reports</div>
          </div>
        </div>
      </section>

      <div id="database">
        <IdeaExplorer ideas={ideas} industries={industries} />
      </div>

      <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-6 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-white">
              Get 5 Verified Software Gaps Every Monday
            </h2>
            <p className="mt-1.5 text-sm text-zinc-300">
              Free weekly breakdown of the highest-pain software complaints, competitor weaknesses, and weekend-buildable MVPs.
            </p>
          </div>
          <NewsletterForm sourcePage="/" />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-base font-semibold text-white">Browse by Industry (pSEO Hubs)</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Dedicated landing pages targeting industry-specific SaaS & tool keywords.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industry/${ind.slug}`}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-emerald-500/50 hover:text-emerald-300"
              >
                {ind.name} ({ind.count})
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-base font-semibold text-white">Competitor Complaint Hubs</h2>
          <p className="mt-1 text-xs text-zinc-400">
            High-intent pages summarizing why users look for simpler alternatives.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {competitors.map((comp) => (
              <Link
                key={comp.slug}
                href={`/complaints/${comp.slug}`}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-emerald-500/50 hover:text-emerald-300"
              >
                {comp.name} Gaps
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
