#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SEARCH_JOBS = [
  { query: "I wish there was a tool", tags: "comment", hitsPerPage: 30 },
  { query: "I would pay for a tool", tags: "comment", hitsPerPage: 25 },
  { query: "paying too much for", tags: "comment", hitsPerPage: 25 },
  { query: "anyone know a tool that", tags: "comment", hitsPerPage: 25 },
  { query: "Is there a tool for", tags: "ask_hn", hitsPerPage: 25 },
  { query: "What tool do you use for", tags: "ask_hn", hitsPerPage: 25 },
  { query: "alternative to", tags: "ask_hn", hitsPerPage: 25 },
];

const EXCLUDE_TITLE_RE = /^(Show HN|Launch HN|Tell HN|Who is hiring|Who wants to be hired|Freelancer\?)/i;
const EXCLUDE_CAREER_RE = /\b(unemployed|laid off|interview|leetcode|salary|resume review|job hunt)\b/i;
const OUTPUT_PATH = path.join(process.cwd(), "data", "raw-hn.json");

async function fetchJob({ query, tags, hitsPerPage }) {
  const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
  url.searchParams.set("query", query);
  url.searchParams.set("tags", tags);
  url.searchParams.set("hitsPerPage", String(hitsPerPage));
  const res = await fetch(url.toString(), { headers: { "User-Agent": "BuildGap-Collector/0.2" } });
  if (!res.ok) throw new Error(`HN Algolia API error ${res.status} for "${query}"`);
  const data = await res.json();
  return data.hits ?? [];
}

function stripHtml(text = "") {
  return text.replace(/<p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

async function main() {
  const seen = new Map();
  for (const job of SEARCH_JOBS) {
    const hits = await fetchJob(job);
    for (const hit of hits) {
      const externalId = String(hit.objectID);
      if (seen.has(externalId)) continue;
      const title = hit.title || hit.story_title || "";
      const body = stripHtml(hit.comment_text || hit.story_text || hit.title || "");
      if (body.length < 60 || body.length > 3000) continue;
      if (EXCLUDE_TITLE_RE.test(title) || EXCLUDE_CAREER_RE.test(`${title} ${body}`)) continue;
      seen.set(externalId, {
        source: "hacker_news", source_label: "Hacker News", external_id: externalId,
        source_url: `https://news.ycombinator.com/item?id=${externalId}`,
        author: hit.author || "unknown", title, body, rating: null,
        upvotes: hit.points ?? 0, comments: hit.num_comments ?? 0,
        matched_query: job.query, published_at: hit.created_at, fetched_at: new Date().toISOString(),
      });
    }
  }
  const results = Array.from(seen.values()).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[collect-hn] Saved ${results.length} filtered signals -> ${OUTPUT_PATH}`);
}

main().catch((err) => { console.error("[collect-hn] Failed:", err.message); process.exit(1); });
