import { cookies } from "next/headers";
import {
  getSupabaseAdminClient,
  getSupabaseAnonClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

export type UserPlan = "free" | "lifetime" | "pro_monthly" | "pro_yearly";

export interface SessionEntitlement {
  authenticated: boolean;
  email: string | null;
  plan: UserPlan;
  isPro: boolean;
  isLocalDemoMode: boolean;
}

export const SESSION_COOKIE_NAME = "bg_access_token";
export const DEMO_PRO_COOKIE_NAME = "bg_demo_pro";

export async function getSessionEntitlement(): Promise<SessionEntitlement> {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    const demoPro = cookieStore.get(DEMO_PRO_COOKIE_NAME)?.value === "1";
    return {
      authenticated: demoPro,
      email: demoPro ? "demo@buildgap.local" : null,
      plan: demoPro ? "lifetime" : "free",
      isPro: demoPro,
      isLocalDemoMode: true,
    };
  }

  const accessToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!accessToken) {
    return {
      authenticated: false,
      email: null,
      plan: "free",
      isPro: false,
      isLocalDemoMode: false,
    };
  }

  const anon = getSupabaseAnonClient();
  if (!anon) {
    return {
      authenticated: false,
      email: null,
      plan: "free",
      isPro: false,
      isLocalDemoMode: false,
    };
  }

  const { data: userData, error } = await anon.auth.getUser(accessToken);
  if (error || !userData.user) {
    return {
      authenticated: false,
      email: null,
      plan: "free",
      isPro: false,
      isLocalDemoMode: false,
    };
  }

  const user = userData.user;
  const admin = getSupabaseAdminClient();
  let plan: UserPlan = "free";

  if (admin) {
    const { data: ent } = await admin
      .from("user_entitlements")
      .select("plan, current_period_end")
      .or(`user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
      .maybeSingle();

    if (ent?.plan) {
      const expired =
        ent.current_period_end &&
        new Date(ent.current_period_end).getTime() < Date.now();
      if (ent.plan === "lifetime" || !expired) {
        plan = ent.plan as UserPlan;
      }
    }
  }

  return {
    authenticated: true,
    email: user.email ?? null,
    plan,
    isPro: plan !== "free",
    isLocalDemoMode: false,
  };
}
