import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "LEMONSQUEEZY_WEBHOOK_SECRET is not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") || "";

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expected, "utf8");

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string; plan?: string } };
    data?: {
      id?: string;
      attributes?: {
        user_email?: string;
        customer_id?: number | string;
        status?: string;
        renews_at?: string | null;
        ends_at?: string | null;
        variant_name?: string;
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name || "";
  const attrs = payload.data?.attributes;
  const email = attrs?.user_email?.toLowerCase().trim();
  const customUserId = payload.meta?.custom_data?.user_id;

  if (!email) {
    return NextResponse.json({ ok: true, ignored: "Missing customer email" });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 503 }
    );
  }

  let plan: "free" | "lifetime" | "pro_monthly" | "pro_yearly" = "free";
  let currentPeriodEnd: string | null = attrs?.renews_at ?? attrs?.ends_at ?? null;

  if (eventName === "order_created") {
    const requestedPlan = payload.meta?.custom_data?.plan;
    const variant = (attrs?.variant_name || "").toLowerCase();
    plan =
      requestedPlan === "pro_monthly" || variant.includes("monthly")
        ? "pro_monthly"
        : "lifetime";
    if (plan === "lifetime") currentPeriodEnd = null;
  } else if (
    eventName === "subscription_created" ||
    eventName === "subscription_updated"
  ) {
    const activeStatuses = new Set(["active", "on_trial", "past_due"]);
    if (attrs?.status && activeStatuses.has(attrs.status)) {
      const variant = (attrs.variant_name || "").toLowerCase();
      plan = variant.includes("year") ? "pro_yearly" : "pro_monthly";
    } else {
      plan = "free";
    }
  } else if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    plan = "free";
  } else {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const resolvedUserId = customUserId || crypto.randomUUID();
  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: resolvedUserId,
      email,
      plan,
      provider: "lemonsqueezy",
      provider_customer_id: attrs?.customer_id ? String(attrs.customer_id) : null,
      provider_subscription_id: payload.data?.id ? String(payload.data.id) : null,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, event: eventName, email, plan });
}
