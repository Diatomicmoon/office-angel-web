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

  // Get the tokens from the DB
  const { data: company, error } = await supabase
    .from("companies")
    .select("quickbooks_access_token, quickbooks_realm_id, quickbooks_token_expires_at")
    .eq("id", companyId)
    .single();

  if (error || !company || !company.quickbooks_access_token) {
    return NextResponse.json({ error: "QuickBooks is not connected for this company" }, { status: 400 });
  }

  // Intuit Sandbox Base URL
  const sandboxBaseUrl = "https://sandbox-quickbooks.api.intuit.com";
  const realmId = company.quickbooks_realm_id;

  try {
    // Let's pull the Profit & Loss report for the current year
    const url = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?minorversion=70`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${company.quickbooks_access_token}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: "Failed to fetch from QB", details: errText }, { status: response.status });
    }

    const reportData = await response.json();
    return NextResponse.json({ success: true, report: reportData });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
