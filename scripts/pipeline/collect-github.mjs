#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const QUERIES = [
  'is:issue is:open "export to" reactions:>25 sort:reactions-+1-desc',
  'is:issue is:open "invoice" OR "billing" OR "PDF" label:enhancement reactions:>20 sort:reactions-+1-desc',
  'is:issue is:open "sync" OR "backup" label:enhancement reactions:>30 sort:reactions-+1-desc',
  'is:issue is:open "bulk" OR "batch" label:enhancement reactions:>25 sort:reactions-+1-desc',
];
const OUTPUT_PATH = path.join(process.cwd(), "data", "raw-github.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchIssues(q) {
  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set("q", q);
  url.searchParams.set("per_page", "20");
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "BuildGap-Collector/0.2" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  return (await res.json()).items ?? [];
}

function cleanText(text = "") {
  return text.replace(/```[\s\S]*?```/g, " [code] ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\s+/g, " ").trim().slice(0, 1200);
}

async function main() {
  const seen = new Map();
  for (const q of QUERIES) {
    try {
      const items = await fetchIssues(q);
      for (const issue of items) {
        const externalId = String(issue.id);
        if (seen.has(externalId)) continue;
        const repoName = issue.repository_url?.split("/repos/")[1] || "unknown";
        const body = cleanText(issue.body || issue.title || "");
        if (body.length < 40) continue;
        seen.set(externalId, {
          source: "github", source_label: "GitHub Issues", external_id: externalId,
          source_url: issue.html_url, author: issue.user?.login || "unknown",
          title: `[${repoName}] ${issue.title}`, body, mentioned_product: repoName.split("/")[1] || repoName,
          rating: null, upvotes: issue.reactions?.total_count ?? 0, comments: issue.comments ?? 0,
          published_at: issue.created_at, fetched_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[collect-github] Query skipped: ${err.message}`);
    }
    await sleep(1200);
  }
  const results = Array.from(seen.values()).sort((a, b) => b.upvotes - a.upvotes);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[collect-github] Saved ${results.length} high-vote issues -> ${OUTPUT_PATH}`);
}

main().catch((err) => { console.error("[collect-github] Failed:", err.message); process.exit(1); });
