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
        .select("id,name,phone_number,created_at,stripe_account_id")
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
      .select("id,name,phone_number,created_at,stripe_account_id")
      .in("id", ids);

    if (cErr) return NextResponse.json({ companies: [], error: cErr }, { status: 400 });

    return NextResponse.json({ companies: companies || [] });
  } catch (e: any) {
    return NextResponse.json({ companies: [], error: e?.message || "error" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, companyId } = await resolveCompanyIdOrThrow();
    
    const body = await req.json().catch(() => ({}));

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    // Make sure user has access to this company
    if (userId) {
      const { data: membership } = await admin
        .from("company_memberships")
        .select("role")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .single();
        
      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const payload: any = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.phone_number !== undefined) payload.phone_number = body.phone_number;
    
    // We can also store aiMode in settings or as a direct column if it exists. 
    // Assuming settings is a JSONB column. We will update the name for now.

    const { data: updatedCompany, error: updateErr } = await admin
      .from("companies")
      .update(payload)
      .eq("id", companyId)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr }, { status: 400 });

    return NextResponse.json({ company: updatedCompany });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 401 });
  }
}
