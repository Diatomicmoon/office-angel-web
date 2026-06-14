import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) {
    return new NextResponse("No company found", { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "AB92XjkDS1CCAJqWexCSXpPl5Iq2ujZDo4FOpLBBzt4Dvo0z1K";
  const redirectUri = "https://www.hardhat-solutions.com/api/quickbooks/callback";
  const scope = "com.intuit.quickbooks.accounting";
  const state = companyId; // Pass company ID through state to link it when QuickBooks returns

  // We must use the Intuit sandbox environment URL for testing
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
