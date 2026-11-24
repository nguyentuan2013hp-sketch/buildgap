import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCompetitors, getCompetitorBySlug } from "@/lib/ideas";

export function generateStaticParams() {
  return getAllCompetitors().map((comp) => ({ slug: comp.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCompetitorBySlug(slug);
  if (!comp) return { title: "Product Not Found" };
  return {
    title: `${comp.name} User Complaints & Alternative Software Ideas`,
    description: `Top recurring complaints about ${comp.name} and focused micro-SaaS alternatives you can build.`,
  };
}

export default async function CompetitorComplaintsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = getCompetitorBySlug(slug);
  if (!comp) notFound();

  const allCompetitors = getAllCompetitors();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {allCompetitors.map((item) => (
          <Link
            key={item.slug}
            href={`/complaints/${item.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              item.slug === slug
                ? "bg-emerald-500 text-zinc-950"
                : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
        <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
          Competitor Gap Report · {comp.category}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">
          Top {comp.name} Complaints & Buildable Alternatives
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">{comp.summary}</p>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-base font-semibold text-white">Recurring Friction Points</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-200">
          {comp.topComplaints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Opportunities Derived From {comp.name} Gaps
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {comp.relatedIdeas.map((idea) => (
            <article
              key={idea.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <Link href={`/ideas/${idea.slug}`}>
                <h3 className="text-base font-semibold text-white hover:text-emerald-300">
                  {idea.title}
                </h3>
              </Link>
              <p className="mt-2 text-sm text-zinc-300">{idea.oneLiner}</p>
              <Link
                href={`/ideas/${idea.slug}`}
                className="mt-4 inline-block text-xs font-medium text-emerald-400 hover:underline"
              >
                Open AI Build Spec →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
