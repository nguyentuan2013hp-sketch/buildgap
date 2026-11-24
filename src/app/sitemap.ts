import type { MetadataRoute } from "next";
import { getAllCompetitors, getAllIdeas, getIndustries } from "@/lib/ideas";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buildgap.example.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const ideaRoutes: MetadataRoute.Sitemap = getAllIdeas().map((idea) => ({
    url: `${baseUrl}/ideas/${idea.slug}`,
    lastModified: new Date(idea.lastSeenAt),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const industryRoutes: MetadataRoute.Sitemap = getIndustries().map((ind) => ({
    url: `${baseUrl}/industry/${ind.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const competitorRoutes: MetadataRoute.Sitemap = getAllCompetitors().map((comp) => ({
    url: `${baseUrl}/complaints/${comp.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...ideaRoutes, ...industryRoutes, ...competitorRoutes];
}
