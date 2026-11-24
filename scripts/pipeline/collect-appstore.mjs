#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const TARGET_APPS = [
  { id: "1232780281", name: "Notion", slug: "notion", industry: "Productivity" },
  { id: "584606479", name: "QuickBooks Accounting", slug: "quickbooks", industry: "Finance & Accounting" },
  { id: "371294472", name: "Shopify", slug: "shopify", industry: "E-commerce" },
  { id: "461504587", name: "Trello", slug: "trello", industry: "Productivity" },
  { id: "474990205", name: "DocuSign", slug: "docusign", industry: "Legal & Docs" },
  { id: "1451094657", name: "Calendly", slug: "calendly", industry: "Scheduling & Sales" },
  { id: "281796108", name: "Evernote", slug: "evernote", industry: "Productivity" },
];
const OUTPUT_PATH = path.join(process.cwd(), "data", "raw-appstore.json");

async function fetchReviews(app) {
  const url = `https://itunes.apple.com/us/rss/customerreviews/page=1/id=${app.id}/sortby=mostrecent/json`;
  const res = await fetch(url, { headers: { "User-Agent": "BuildGap-Collector/0.2" } });
  if (!res.ok) throw new Error(`App Store RSS error ${res.status} for ${app.name}`);
  const entries = (await res.json())?.feed?.entry;
  return Array.isArray(entries) ? entries.filter((e) => e["im:rating"]) : [];
}

async function main() {
  const results = [];
  for (const app of TARGET_APPS) {
    try {
      const entries = await fetchReviews(app);
      for (const entry of entries) {
        const rating = Number(entry["im:rating"]?.label ?? 5);
        if (rating > 3) continue;
        const body = (entry.content?.label || "").replace(/\s+/g, " ").trim();
        if (body.length < 70) continue;
        results.push({
          source: "app_store", source_label: "App Store Reviews",
          external_id: String(entry.id?.label || `${app.id}-${results.length}`),
          source_url: entry.link?.attributes?.href || `https://apps.apple.com/us/app/id${app.id}`,
          author: entry.author?.name?.label || "app_store_user",
          title: `[${app.name} ${rating}★] ${entry.title?.label || ""}`.trim(),
          body, mentioned_product: app.name, mentioned_product_slug: app.slug,
          industry_hint: app.industry, rating, upvotes: Number(entry["im:voteSum"]?.label ?? 0),
          comments: 0, published_at: entry.updated?.label || new Date().toISOString(),
          fetched_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[collect-appstore] Skipped ${app.name}: ${err.message}`);
    }
  }
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`[collect-appstore] Saved ${results.length} 1–3★ complaints -> ${OUTPUT_PATH}`);
}

main().catch((err) => { console.error("[collect-appstore] Failed:", err.message); process.exit(1); });
