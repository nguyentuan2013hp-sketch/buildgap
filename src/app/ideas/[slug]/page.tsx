import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyPromptButton } from "@/components/CopyPromptButton";
import { DemoProToggle } from "@/components/DemoProToggle";
import { getSessionEntitlement } from "@/lib/auth";
import { getAllIdeas, getIdeaBySlug } from "@/lib/ideas";

export function generateStaticParams() {
  return getAllIdeas().map((idea) => ({ slug: idea.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);
  if (!idea) return { title: "Opportunity Not Found" };
  return {
    title: `${idea.title} — Pain Point & AI Build Spec`,
    description: idea.oneLiner,
  };
}

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idea = getIdeaBySlug(slug);
  if (!idea) notFound();

  const session = await getSessionEntitlement();
  const visibleEvidence = session.isPro
    ? idea.evidence
    : idea.evidence.filter((e) => e.isFreePreview);
  const lockedEvidenceCount = Math.max(0, idea.evidenceCount - visibleEvidence.length);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-200">
            Idea Feed
          </Link>
          <span>/</span>
          <Link href={`/industry/${idea.industrySlug}`} className="hover:text-zinc-200">
            {idea.industryName}
          </Link>
          <span>/</span>
          <span className="text-zinc-200">{idea.productType}</span>
        </div>

        {session.isLocalDemoMode && <DemoProToggle isPro={session.isPro} />}
      </div>

      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
            Pain Score {idea.painScore}/100
          </span>
          <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-zinc-200">
            {idea.productType}
          </span>
          <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-zinc-300">
            AI MVP: {idea.buildTime}
          </span>
          <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-300">
            Willingness to Pay: {idea.willingnessToPay}
          </span>
          {session.isPro && (
            <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 font-medium text-emerald-300">
              Pro Unlocked
            </span>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-4xl">
          {idea.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-300">
          {idea.oneLiner}
        </p>

        <div className="mt-6 grid gap-4 border-t border-zinc-800 pt-5 text-sm sm:grid-cols-3">
          <div>
            <div className="text-xs text-zinc-400">Target Audience</div>
            <div className="mt-1 font-medium text-zinc-100">{idea.targetAudience}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Suggested Monetization</div>
            <div className="mt-1 font-medium text-zinc-100">{idea.monetizationModel}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Evidence Sources</div>
            <div className="mt-1 font-medium text-zinc-100">
              {idea.evidenceCount} signals ({idea.sources.join(", ")})
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-white">The Problem</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {idea.problemSummary}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">Verified User Evidence</h2>
              <span className="text-xs text-zinc-400">
                {session.isPro
                  ? `Showing ${visibleEvidence.length} curated quotes from ${idea.evidenceCount} signals`
                  : `Showing ${visibleEvidence.length} free preview · ${lockedEvidenceCount} more signals in Pro`}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {visibleEvidence.map((item) => (
                <blockquote
                  key={item.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="text-sm leading-relaxed text-zinc-200">
                    “{item.quote}”
                  </p>
                  <footer className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                    <span>
                      {item.source} · {item.author} · {item.publishedAt}
                    </span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      Source Link ↗
                    </a>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-500/30 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  AI Build Spec (Cursor / Claude Code Ready)
                </h2>
                <p className="text-xs text-zinc-400">
                  Scoped MVP, starter database schema, and copy-paste starter prompt.
                </p>
              </div>
              {session.isPro && (
                <div className="flex flex-wrap items-center gap-2">
                  <CopyPromptButton text={idea.buildSpec.prompt} label="Copy Starter Prompt" />
                  <a
                    href={`/api/ideas/${idea.slug}/export`}
                    className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-500"
                  >
                    Download .md
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  1. MVP Scope (Free Preview)
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-zinc-200">
                  {idea.mvpScope.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>

              {session.isPro ? (
                <>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      2. Technical PRD
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                      {idea.buildSpec.prd}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      3. Starter Database Schema
                    </h3>
                    <pre className="mt-1.5 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200">
                      <code>{idea.buildSpec.schema}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      4. AI Starter Prompt
                    </h3>
                    <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-200">
                      <code>{idea.buildSpec.prompt}</code>
                    </pre>
                  </div>
                </>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6">
                  <div className="pointer-events-none select-none space-y-3 opacity-25 blur-sm">
                    <div className="h-3 w-40 rounded bg-emerald-500/40" />
                    <div className="h-3 w-full rounded bg-zinc-700" />
                    <div className="h-3 w-5/6 rounded bg-zinc-700" />
                    <div className="h-16 w-full rounded bg-zinc-800" />
                  </div>
                  <div className="relative z-10 -mt-20 flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/95 p-5 text-center shadow-xl">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Pro Member Asset
                    </span>
                    <h3 className="mt-2.5 text-base font-semibold text-white">
                      Unlock Full Technical PRD, Database Schema & AI Starter Prompt
                    </h3>
                    <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
                      Copy straight into Cursor or Claude Code, export as Markdown, and view every linked user complaint.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                      <Link
                        href="/pricing"
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
                      >
                        Unlock Lifetime Access ($49)
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500"
                      >
                        Already Paid? Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-base font-semibold text-white">Competitor Gaps</h2>
            <div className="mt-3 space-y-3">
              {idea.competitors.map((comp) => (
                <div
                  key={comp.slug}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5"
                >
                  <Link
                    href={`/complaints/${comp.slug}`}
                    className="text-sm font-semibold text-emerald-300 hover:underline"
                  >
                    {comp.name} →
                  </Link>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {comp.weakness}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {!session.isPro && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h2 className="text-base font-semibold text-white">
                Unlock Full Evidence & Markdown Exports
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                One-time $49 early bird access unlocks all current & future verified pain points and AI-ready specs.
              </p>
              <Link
                href="/pricing"
                className="mt-4 block w-full rounded-lg bg-emerald-500 py-2.5 text-center text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                Get Lifetime Access ($49)
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
