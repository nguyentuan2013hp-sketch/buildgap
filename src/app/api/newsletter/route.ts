import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_SUBSCRIBERS_PATH = path.join(process.cwd(), "data", "subscribers.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: string; sourcePage?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const sourcePage = (body.sourcePage || "/").slice(0, 120);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const { error } = await admin
        .from("newsletter_subscribers")
        .upsert({ email, source_page: sourcePage }, { onConflict: "email" });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, storage: "supabase" });
    }
  }

  try {
    fs.mkdirSync(path.dirname(LOCAL_SUBSCRIBERS_PATH), { recursive: true });
    const existing: Array<{ email: string; sourcePage: string; createdAt: string }> =
      fs.existsSync(LOCAL_SUBSCRIBERS_PATH)
        ? JSON.parse(fs.readFileSync(LOCAL_SUBSCRIBERS_PATH, "utf-8"))
        : [];

    if (!existing.some((item) => item.email === email)) {
      existing.push({ email, sourcePage, createdAt: new Date().toISOString() });
      fs.writeFileSync(LOCAL_SUBSCRIBERS_PATH, JSON.stringify(existing, null, 2), "utf-8");
    }
    return NextResponse.json({ ok: true, storage: "local" });
  } catch {
    return NextResponse.json({ ok: true, storage: "ephemeral" });
  }
}
