#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_PATH = path.join(DATA_DIR, "candidates.json");
const PAIN_KEYWORDS = ["alternative","too expensive","expensive","price","pricing","subscription","paywall","bloated","slow","wish there was","looking for a tool","is there a tool","would pay","export","pdf","csv","sync","offline","backup","invoice","automate","batch","bulk","manually","broken","crash","cancel","missing","feature","spreadsheet"];

function scoreSignal(signal) {
  const haystack = `${signal.title || ""} ${signal.body || ""}`.toLowerCase();
  let keywordHits = 0;
  for (const kw of PAIN_KEYWORDS) if (haystack.includes(kw)) keywordHits += 1;
  let base = Math.min(55, keywordHits * 11);
  if (signal.source === "app_store" && signal.rating && signal.rating <= 2) base += 20;
  if (signal.source === "github") base += Math.min(35, Math.round((signal.upvotes || 0) * 0.25));
  else base += Math.min(25, Math.round((signal.upvotes || 0) * 0.5 + (signal.comments || 0) * 1.0));
  if ((signal.body || "").length >= 160) base += 8;
  return Math.min(100, base);
}

function main() {
  const rawFiles = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith("raw-") && f.endsWith(".json"));
  const candidates = [];
  for (const file of rawFiles) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    for (const item of items) {
      const score = scoreSignal(item);
      if (score >= 30) candidates.push({ ...item, candidate_score: score });
    }
  }
  candidates.sort((a, b) => b.candidate_score - a.candidate_score);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(candidates, null, 2), "utf-8");
  console.log(`[normalize] Filtered ${candidates.length} candidates -> ${OUTPUT_PATH}`);
}

main();
