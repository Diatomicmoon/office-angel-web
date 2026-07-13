import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export async function GET(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const { data, error } = await supabase
      .from('material_catalog')
      .select('*')
      .eq('company_id', companyId)
      .order('last_updated', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ items: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
