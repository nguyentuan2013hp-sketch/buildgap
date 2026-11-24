#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CANDIDATES_PATH = path.join(DATA_DIR, "candidates.json");
const IDEAS_PATH = path.join(DATA_DIR, "ideas.json");

const SYSTEM_PROMPT = `You are a SaaS product analyst building a verified pain-point database for AI-assisted indie developers. Return ONLY valid JSON matching: { "ideas": [ ...SoftwareIdea ] } using exact source URLs, authors, dates, and short verbatim quotes from the input signals.`;

async function callLLM(batch) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, temperature: 0.2, response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Synthesize up to 10 buildable software opportunities from:\n${JSON.stringify(batch)}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM API error ${res.status}`);
  return JSON.parse((await res.json()).choices?.[0]?.message?.content || "{}");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) { console.error("[enrich] Missing OPENAI_API_KEY"); process.exit(1); }
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf-8")).slice(0, 40);
  const parsed = await callLLM(candidates);
  const existing = fs.existsSync(IDEAS_PATH) ? JSON.parse(fs.readFileSync(IDEAS_PATH, "utf-8")) : [];
  const merged = new Map(existing.map((i) => [i.slug, i]));
  for (const idea of parsed.ideas || []) if (idea?.slug && idea?.title) merged.set(idea.slug, { ...idea, isSampleData: false });
  const finalIdeas = Array.from(merged.values()).sort((a, b) => b.painScore - a.painScore);
  fs.writeFileSync(IDEAS_PATH, JSON.stringify(finalIdeas, null, 2), "utf-8");
  console.log(`[enrich] Saved ${finalIdeas.length} ideas -> ${IDEAS_PATH}`);
}

main().catch((err) => { console.error("[enrich] Failed:", err.message); process.exit(1); });
