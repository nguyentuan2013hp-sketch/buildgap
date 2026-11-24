import { NextResponse } from "next/server";
import { DEMO_PRO_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  res.cookies.delete(DEMO_PRO_COOKIE_NAME);
  return res;
}
