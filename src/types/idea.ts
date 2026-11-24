export type ProductType =
  | "Web Tool"
  | "Chrome Extension"
  | "Shopify App"
  | "Micro-SaaS"
  | "CLI";

export type BuildTime = "1 Day" | "1 Weekend" | "2 Weeks";

export type WillingnessToPay = "High" | "Medium" | "Low";

export interface CompetitorGap {
  name: string;
  slug: string;
  weakness: string;
}

export interface IdeaEvidence {
  id: string;
  source: string;
  quote: string;
  sourceUrl: string;
  author: string;
  publishedAt: string;
  isFreePreview: boolean;
}

export interface SoftwareIdea {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
  problemSummary: string;
  industrySlug: string;
  industryName: string;
  productType: ProductType;
  buildTime: BuildTime;
  painScore: number;
  willingnessToPay: WillingnessToPay;
  evidenceCount: number;
  sources: string[];
  targetAudience: string;
  competitors: CompetitorGap[];
  mvpScope: string[];
  monetizationModel: string;
  buildSpec: {
    prd: string;
    schema: string;
    prompt: string;
  };
  evidence: IdeaEvidence[];
  lastSeenAt: string;
  isSampleData?: boolean;
}

export interface CompetitorProfile {
  slug: string;
  name: string;
  category: string;
  summary: string;
  topComplaints: string[];
  relatedIdeas: SoftwareIdea[];
}
