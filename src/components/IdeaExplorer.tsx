"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BuildTime, ProductType, SoftwareIdea } from "@/types/idea";

interface IdeaExplorerProps {
  ideas: SoftwareIdea[];
  industries: Array<{ slug: string; name: string; count: number }>;
}

const PRODUCT_TYPES: Array<"All" | ProductType> = [
  "All",
  "Web Tool",
  "Chrome Extension",
  "Shopify App",
  "Micro-SaaS",
  "CLI",
];

const BUILD_TIMES: Array<"All" | BuildTime> = [
  "All",
  "1 Day",
  "1 Weekend",
  "2 Weeks",
];

export function IdeaExplorer({ ideas, industries }: IdeaExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedType, setSelectedType] = useState<"All" | ProductType>("All");
  const [selectedBuildTime, setSelectedBuildTime] = useState<"All" | BuildTime>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas.filter((idea) => {
      if (selectedIndustry !== "all" && idea.industrySlug !== selectedIndustry) {
        return false;
      }
      if (selectedType !== "All" && idea.productType !== selectedType) {
        return false;
      }
      if (selectedBuildTime !== "All" && idea.buildTime !== selectedBuildTime) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        idea.title,
        idea.oneLiner,
        idea.problemSummary,
        idea.industryName,
        idea.targetAudience,
        ...idea.competitors.map((c) => c.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [ideas, query, selectedIndustry, selectedType, selectedBuildTime]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pain points, Notion, Evernote, QuickBooks..."
            className="md:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            aria-label="Filter by industry"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Industries ({ideas.length})</option>
            {industries.map((ind) => (
              <option key={ind.slug} value={ind.slug}>
                {ind.name} ({ind.count})
              </option>
            ))}
          </select>

          <select
            value={selectedBuildTime}
            onChange={(e) => setSelectedBuildTime(e.target.value as "All" | BuildTime)}
            aria-label="Filter by AI build time"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
          >
            {BUILD_TIMES.map((time) => (
              <option key={time} value={time}>
                {time === "All" ? "Any AI Build Time" : `AI Build: ${time}`}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PRODUCT_TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-emerald-500 text-zinc-950"
                    : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {type}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-zinc-400">
            Showing {filtered.length} of {ideas.length} opportunities
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-zinc-400">
          No matching software opportunities found. Try clearing one filter.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((idea) => (
            <article
              key={idea.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/50"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
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
                    WTP: {idea.willingnessToPay}
                  </span>
                </div>

                <Link href={`/ideas/${idea.slug}`} className="group block">
                  <h2 className="text-lg font-semibold leading-snug text-white transition group-hover:text-emerald-300">
                    {idea.title}
                  </h2>
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {idea.oneLiner}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <Link
                    href={`/industry/${idea.industrySlug}`}
                    className="hover:text-zinc-200"
                  >
                    Industry: {idea.industryName}
                  </Link>
                  <span>• {idea.evidenceCount} signals</span>
                  <span>• {idea.sources.join(", ")}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                <span className="text-xs text-zinc-400">
                  Monetization: <strong className="font-medium text-zinc-200">{idea.monetizationModel}</strong>
                </span>
                <Link
                  href={`/ideas/${idea.slug}`}
                  className="ml-3 shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-emerald-400 hover:text-emerald-300"
                >
                  Open Spec →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
