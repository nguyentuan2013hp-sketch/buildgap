import { NextRequest, NextResponse } from "next/server";
import { getAllIdeas } from "@/lib/ideas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry");
  const productType = searchParams.get("productType");
  const buildTime = searchParams.get("buildTime");
  const q = searchParams.get("q")?.trim().toLowerCase();

  let ideas = getAllIdeas();

  if (industry) {
    ideas = ideas.filter((i) => i.industrySlug === industry);
  }
  if (productType) {
    ideas = ideas.filter((i) => i.productType === productType);
  }
  if (buildTime) {
    ideas = ideas.filter((i) => i.buildTime === buildTime);
  }
  if (q) {
    ideas = ideas.filter((i) =>
      `${i.title} ${i.oneLiner} ${i.problemSummary}`.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: ideas.length,
    items: ideas,
  });
}
