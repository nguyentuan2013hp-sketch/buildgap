import fs from "node:fs";
import path from "node:path";
import type { CompetitorProfile, SoftwareIdea } from "@/types/idea";

const DATA_DIR = path.join(process.cwd(), "data");
const LIVE_FILE = path.join(DATA_DIR, "ideas.json");
const SEED_FILE = path.join(DATA_DIR, "seed-ideas.json");

function loadAllIdeas(): SoftwareIdea[] {
  const filePath = fs.existsSync(LIVE_FILE) ? LIVE_FILE : SEED_FILE;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as SoftwareIdea[];
  return parsed.sort((a, b) => b.painScore - a.painScore);
}

export function getAllIdeas(): SoftwareIdea[] {
  return loadAllIdeas();
}

export function getIdeaBySlug(slug: string): SoftwareIdea | undefined {
  return loadAllIdeas().find((item) => item.slug === slug);
}

export function getIndustries(): Array<{ slug: string; name: string; count: number }> {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const idea of loadAllIdeas()) {
    const existing = map.get(idea.industrySlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(idea.industrySlug, {
        slug: idea.industrySlug,
        name: idea.industryName,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getIdeasByIndustry(industrySlug: string): SoftwareIdea[] {
  return loadAllIdeas().filter((idea) => idea.industrySlug === industrySlug);
}

export function getAllCompetitors(): CompetitorProfile[] {
  const map = new Map<string, CompetitorProfile>();
  for (const idea of loadAllIdeas()) {
    for (const comp of idea.competitors) {
      const existing = map.get(comp.slug);
      if (existing) {
        if (!existing.topComplaints.includes(comp.weakness)) {
          existing.topComplaints.push(comp.weakness);
        }
        if (!existing.relatedIdeas.some((i) => i.id === idea.id)) {
          existing.relatedIdeas.push(idea);
        }
      } else {
        map.set(comp.slug, {
          slug: comp.slug,
          name: comp.name,
          category: idea.industryName,
          summary: `Recurring user complaints and buildable software gaps identified around ${comp.name}.`,
          topComplaints: [comp.weakness],
          relatedIdeas: [idea],
        });
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.relatedIdeas.length - a.relatedIdeas.length
  );
}

export function getCompetitorBySlug(slug: string): CompetitorProfile | undefined {
  return getAllCompetitors().find((item) => item.slug === slug);
}
