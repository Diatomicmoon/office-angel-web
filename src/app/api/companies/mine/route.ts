import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export async function GET() {
  try {
    const { userId } = await resolveCompanyIdOrThrow();

    // In pinned-tenant mode, just return the pinned company.
    if (!userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
      );
      const { data: company } = await supabase
        .from("companies")
        .select("id,name,phone_number,created_at")
        .eq("id", process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID!)
        .single();
      return NextResponse.json({ companies: company ? [company] : [] });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const { data: memberships, error: mErr } = await admin
      .from("company_memberships")
      .select("company_id, role")
      .eq("user_id", userId);

    if (mErr) return NextResponse.json({ companies: [], error: mErr }, { status: 400 });

    const ids = (memberships || []).map((m: any) => m.company_id);
    if (ids.length === 0) return NextResponse.json({ companies: [] });

    const { data: companies, error: cErr } = await admin
      .from("companies")
      .select("id,name,phone_number,created_at")
      .in("id", ids);

    if (cErr) return NextResponse.json({ companies: [], error: cErr }, { status: 400 });

    return NextResponse.json({ companies: companies || [] });
  } catch (e: any) {
    return NextResponse.json({ companies: [], error: e?.message || "error" }, { status: 401 });
  }
}
