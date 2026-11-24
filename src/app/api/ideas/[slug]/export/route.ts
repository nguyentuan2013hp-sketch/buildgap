import { NextRequest, NextResponse } from "next/server";
import { getSessionEntitlement } from "@/lib/auth";
import { getIdeaBySlug } from "@/lib/ideas";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const idea = getIdeaBySlug(slug);
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const session = await getSessionEntitlement();
  if (!session.isPro) {
    return NextResponse.json(
      { error: "Upgrade to Lifetime or Pro to export full AI Build Specs." },
      { status: 403 }
    );
  }

  const markdown = [
    `# ${idea.title}`,
    "",
    `> ${idea.oneLiner}`,
    "",
    `- **Industry**: ${idea.industryName}`,
    `- **Product Type**: ${idea.productType}`,
    `- **Estimated AI MVP Build Time**: ${idea.buildTime}`,
    `- **Pain Score**: ${idea.painScore}/100`,
    `- **Willingness to Pay**: ${idea.willingnessToPay}`,
    `- **Target Audience**: ${idea.targetAudience}`,
    `- **Suggested Monetization**: ${idea.monetizationModel}`,
    "",
    "## Problem Summary",
    idea.problemSummary,
    "",
    "## MVP Scope",
    ...idea.mvpScope.map((item) => `- ${item}`),
    "",
    "## Technical PRD",
    idea.buildSpec.prd,
    "",
    "## Starter Database Schema",
    "```sql",
    idea.buildSpec.schema,
    "```",
    "",
    "## Cursor / Claude Code Starter Prompt",
    "```text",
    idea.buildSpec.prompt,
    "```",
    "",
    "## Verified User Evidence",
    ...idea.evidence.map(
      (ev) =>
        `- **${ev.source}** (${ev.author}, ${ev.publishedAt}): "${ev.quote}" — ${ev.sourceUrl}`
    ),
    "",
  ].join("\n");

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="buildgap-${idea.slug}.md"`,
    },
  });
}
