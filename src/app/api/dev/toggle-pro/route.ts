import { NextRequest, NextResponse } from "next/server";
import { DEMO_PRO_COOKIE_NAME } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not available in production auth mode" }, { status: 404 });
  }

  const current = request.cookies.get(DEMO_PRO_COOKIE_NAME)?.value === "1";
  const nextVal = current ? "0" : "1";

  const res = NextResponse.json({ ok: true, isPro: nextVal === "1" });
  res.cookies.set(DEMO_PRO_COOKIE_NAME, nextVal, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
