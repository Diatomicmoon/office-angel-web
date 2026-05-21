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
  const token = company.quickbooks_access_token;

  try {
    // 1. Profit & Loss
    const plUrl = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?minorversion=70`;
    const plRes = await fetch(plUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });
    
    if (!plRes.ok) {
       const errText = await plRes.text();
       return NextResponse.json({ error: "QuickBooks API Error (Token likely expired)", details: errText }, { status: plRes.status });
    }
    const plData = await plRes.json();

    // 2. Aged Receivables (Money Outstanding)
    const arUrl = `${sandboxBaseUrl}/v3/company/${realmId}/reports/AgedReceivable?minorversion=70`;
    const arRes = await fetch(arUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });
    const arData = arRes.ok ? await arRes.json() : null;

    // Build the clean payload for the frontend
    const findTotal = (rows: any[], name: string): number => {
      if (!rows) return 0;
      for (const r of rows) {
        if (r.Summary && r.Summary.ColData && r.Summary.ColData[0] && (r.Summary.ColData[0].value === name || r.Summary.ColData[0].value.includes(name))) {
           return parseFloat(r.Summary.ColData[1].value) || 0;
        }
        if (r.ColData && r.ColData[0] && (r.ColData[0].value === name || r.ColData[0].value.includes(name))) {
           return parseFloat(r.ColData[1].value) || 0;
        }
        if (r.Rows && r.Rows.Row) {
           const found = findTotal(r.Rows.Row, name);
           if (found !== 0) return found;
        }
      }
      return 0;
    };

    let grossProfit = 0;
    let totalExpenses = 0;
    let netIncome = 0;
    let accountsReceivable = 0;

    if (plData.Rows && plData.Rows.Row) {
       grossProfit = findTotal(plData.Rows.Row, "Gross Profit");
       totalExpenses = findTotal(plData.Rows.Row, "Total Expenses");
       netIncome = findTotal(plData.Rows.Row, "Net Income") || findTotal(plData.Rows.Row, "Net Operating Income");
    }

    if (arData && arData.Rows && arData.Rows.Row) {
       accountsReceivable = findTotal(arData.Rows.Row, "TOTAL");
    }

    return NextResponse.json({ 
       success: true, 
       source: "live_quickbooks", 
       report: {
         grossProfit,
         totalExpenses,
         netIncome,
         accountsReceivable,
         openInvoicesCount: 0, // Would require an Invoice query
         profitByCrew: [], // Calculated locally in Supabase later
         topExpenseCategories: [] // Would require parsing the Expenses tree
       },
       raw: {
         pl: plData,
         ar: arData
       }
    });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
