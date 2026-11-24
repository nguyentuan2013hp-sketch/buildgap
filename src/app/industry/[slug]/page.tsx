import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdeasByIndustry, getIndustries } from "@/lib/ideas";

export function generateStaticParams() {
  return getIndustries().map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustries().find((i) => i.slug === slug);
  if (!industry) return { title: "Industry Not Found" };
  return {
    title: `${industry.name} Software Pain Points & Micro-SaaS Ideas`,
    description: `Verified ${industry.name} software gaps backed by real user complaints, ready to build with AI coding tools.`,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ideas = getIdeasByIndustry(slug);
  if (ideas.length === 0) notFound();

  const industryName = ideas[0].industryName;
  const allIndustries = getIndustries();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {allIndustries.map((ind) => (
          <Link
            key={ind.slug}
            href={`/industry/${ind.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              ind.slug === slug
                ? "bg-emerald-500 text-zinc-950"
                : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {ind.name} ({ind.count})
          </Link>
        ))}
      </div>

      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-white sm:text-4xl">
          {industryName} Software Gaps & Build Ideas
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
          Validated problems users actively complain about in {industryName}—scoped into small tools and Micro-SaaS MVPs you can ship quickly with AI.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {ideas.map((idea) => (
          <article
            key={idea.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/40"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
                Pain {idea.painScore}/100
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
                {idea.productType}
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
                {idea.buildTime}
              </span>
            </div>
            <Link href={`/ideas/${idea.slug}`} className="mt-3 block">
              <h2 className="text-lg font-semibold text-white hover:text-emerald-300">
                {idea.title}
              </h2>
            </Link>
            <p className="mt-2 text-sm text-zinc-300">{idea.oneLiner}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
              <span>{idea.evidenceCount} signals</span>
              <Link href={`/ideas/${idea.slug}`} className="text-emerald-400 hover:underline">
                View AI Build Spec →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
