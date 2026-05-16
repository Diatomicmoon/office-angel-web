import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data: c0 } = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = c0?.[0]?.id;
  }

  if (!companyId) {
    return new NextResponse("No company found", { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "AB92XjkDS1CCAJqWexCSXpPl5Iq2ujZDo4FOpLBBzt4Dvo0z1K";
  const redirectUri = "https://www.office-angel.com/api/quickbooks/callback";
  const scope = "com.intuit.quickbooks.accounting";
  const state = companyId; // Pass company ID through state to link it when QuickBooks returns

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
