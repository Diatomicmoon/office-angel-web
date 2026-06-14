import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Cookie name used to persist selected tenant.
export const TENANT_COOKIE = "oa_company_id";

/**
 * Resolve the active company_id.
 *
 * Modes:
 * - Default: fall back to OFFICE_ANGEL_COMPANY_ID (single-tenant per deployment)
 * - If OFFICE_ANGEL_TENANT_MODE="auth": require a logged-in user and verify membership
 */
export async function resolveCompanyIdOrThrow() {
  const tenantMode = process.env.HARD_HAT_TENANT_MODE || process.env.OFFICE_ANGEL_TENANT_MODE || "auth";

  // Legacy / beta: pinned tenant via env
  if (tenantMode !== "auth") {
    const pinned = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
    if (!pinned) throw new Error("Missing OFFICE_ANGEL_COMPANY_ID (and OFFICE_ANGEL_TENANT_MODE is not 'auth').");
    return { companyId: pinned, userId: null };
  }

  // Auth tenant mode
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: userRes, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userRes?.user) throw new Error("Not authenticated");

  const userId = userRes.user.id;
  const selected = cookieStore.get(TENANT_COOKIE)?.value || null;

  // Use service role for membership lookup.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: memberships, error: mErr } = await admin
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userId);

  if (mErr) throw new Error(mErr.message);
  const companyIds = (memberships || []).map((m: any) => m.company_id);
  if (companyIds.length === 0) throw new Error("No company memberships");

  const companyId = selected && companyIds.includes(selected) ? selected : companyIds[0];
  return { companyId, userId };
}
