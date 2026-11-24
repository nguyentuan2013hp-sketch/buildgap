#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const IDEAS_PATH = path.join(process.cwd(), "data", "ideas.json");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { console.error("[push-supabase] Missing env vars"); process.exit(1); }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const ideas = JSON.parse(fs.readFileSync(IDEAS_PATH, "utf-8"));
  const competitorMap = new Map();

  for (const idea of ideas) {
    const { data: upsertedIdea, error: ideaErr } = await supabase.from("ideas").upsert({
      slug: idea.slug, title: idea.title, one_liner: idea.oneLiner, problem_summary: idea.problemSummary,
      industry_slug: idea.industrySlug, industry_name: idea.industryName, product_type: idea.productType,
      build_time: idea.buildTime, pain_score: idea.painScore, willingness_to_pay: idea.willingnessToPay,
      evidence_count: idea.evidenceCount, sources: idea.sources, target_audience: idea.targetAudience,
      competitors: idea.competitors, mvp_scope: idea.mvpScope, monetization_model: idea.monetizationModel,
      build_spec_prd: idea.buildSpec.prd, build_spec_schema: idea.buildSpec.schema, build_spec_prompt: idea.buildSpec.prompt,
      is_published: true, last_seen_at: idea.lastSeenAt, updated_at: new Date().toISOString(),
    }, { onConflict: "slug" }).select("id").single();
    if (ideaErr || !upsertedIdea) throw new Error(ideaErr?.message || "Upsert failed");

    await supabase.from("idea_evidence").delete().eq("idea_id", upsertedIdea.id);
    if (idea.evidence?.length) {
      const { error: evErr } = await supabase.from("idea_evidence").insert(
        idea.evidence.map((ev) => ({
          idea_id: upsertedIdea.id, source: ev.source, quote: ev.quote, source_url: ev.sourceUrl,
          author: ev.author, published_at: ev.publishedAt, is_free_preview: Boolean(ev.isFreePreview),
        }))
      );
      if (evErr) throw new Error(evErr.message);
    }

    for (const comp of idea.competitors || []) {
      const prev = competitorMap.get(comp.slug) || {
        slug: comp.slug, name: comp.name, category: idea.industryName,
        summary: `Recurring user complaints and buildable software gaps identified around ${comp.name}.`,
        top_complaints: [], complaint_count: 0,
      };
      if (!prev.top_complaints.includes(comp.weakness)) prev.top_complaints.push(comp.weakness);
      prev.complaint_count += idea.evidenceCount;
      competitorMap.set(comp.slug, prev);
    }
  }

  for (const comp of competitorMap.values()) {
    const { error } = await supabase.from("competitor_profiles").upsert({ ...comp, updated_at: new Date().toISOString() }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
  }
  console.log(`[push-supabase] Synced ${ideas.length} ideas and ${competitorMap.size} competitors.`);
}

main().catch((err) => { console.error("[push-supabase] Failed:", err.message); process.exit(1); });
