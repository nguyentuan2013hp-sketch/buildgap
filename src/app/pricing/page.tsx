import type { Metadata } from "next";
import Link from "next/link";
import { getSessionEntitlement } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pricing — Simple Plans for Indie AI Builders",
  description:
    "Unlock the full software pain-point database, verified complaint links, and AI-ready MVP starter specs.",
};

function withEmailPrefill(baseUrl: string | undefined, email: string | null): string {
  if (!baseUrl) return "/login";
  if (!email) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}checkout[email]=${encodeURIComponent(email)}`;
}

export default async function PricingPage() {
  const session = await getSessionEntitlement();
  const lifetimeUrl = process.env.NEXT_PUBLIC_CHECKOUT_LIFETIME_URL;
  const proUrl = process.env.NEXT_PUBLIC_CHECKOUT_PRO_URL;
  const checkoutConfigured = Boolean(lifetimeUrl || proUrl);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Explore curated software gaps and validate demand before you build.",
      cta: "Browse Free Feed",
      href: "/",
      external: false,
      highlighted: false,
      features: [
        "Browse all public opportunity cards",
        "Read top 2 verified complaint quotes per idea",
        "Filter by industry, product type & AI build time",
        "Weekly digest of 5 top pain points",
      ],
    },
    {
      name: "Lifetime Early Bird",
      price: "$49",
      period: "one-time",
      description: "Best for solo AI builders who want instant access without another subscription.",
      cta: session.isPro ? "Active Plan" : "Get Lifetime Access",
      href: withEmailPrefill(lifetimeUrl, session.email),
      external: Boolean(lifetimeUrl),
      highlighted: true,
      features: [
        "Full access to entire verified pain-point database",
        "All original source thread & App Store/GitHub links",
        "Copyable Cursor / Claude Code PRD + Schema + Prompt",
        "1-click Markdown (.md) spec export & all future additions",
      ],
    },
    {
      name: "Pro Radar",
      price: "$19",
      period: "/month",
      description: "For agencies and serial builders shipping multiple micro-SaaS products.",
      cta: session.plan === "pro_monthly" ? "Active Plan" : "Start Pro Monthly",
      href: withEmailPrefill(proUrl, session.email),
      external: Boolean(proUrl),
      highlighted: false,
      features: [
        "Everything in Lifetime Access",
        "Daily fresh signal alerts by industry",
        "Custom competitor complaint tracking (up to 10 products)",
        "JSON API access for automated agent workflows",
      ],
    },
  ];

  return (
    <div className="space-y-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          One validated idea pays for this 100× over.
        </h1>
        <p className="mt-3 text-base text-zinc-300">
          Start free, or unlock full source evidence and AI-ready MVP specifications. Global cards & PayPal supported via Lemon Squeezy Merchant of Record checkout.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col justify-between rounded-3xl border p-6 ${
              plan.highlighted
                ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-zinc-400">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{plan.description}</p>

              <ul className="mt-6 space-y-2.5 text-sm text-zinc-200">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.external ? (
              <a
                href={plan.href}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : "border border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500"
                }`}
              >
                {plan.cta}
              </a>
            ) : (
              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                    : "border border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500"
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {!checkoutConfigured && (
        <p className="text-center text-xs text-zinc-500">
          Checkout URLs are ready to bind via <code>NEXT_PUBLIC_CHECKOUT_LIFETIME_URL</code> and{" "}
          <code>NEXT_PUBLIC_CHECKOUT_PRO_URL</code>. See <code>docs/04-DEPLOY.md</code>.
        </p>
      )}
    </div>
  );
}
