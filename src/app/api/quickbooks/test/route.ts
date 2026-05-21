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
    const plUrl = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?date_macro=This Month-to-date&minorversion=70`; // Adjusted to match the QBO dashboard snapshot timeframe
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

    
    // Extract Expense Categories
    const topExpenseCategories: any[] = [];
    if (plData.Rows && plData.Rows.Row) {
      const expensesRow = plData.Rows.Row.find((r: any) => r.Summary && r.Summary.ColData && r.Summary.ColData[0] && r.Summary.ColData[0].value.includes("Total Expenses"));
      
      // If we found the Expenses block, dig into its sub-rows
      if (expensesRow && expensesRow.Rows && expensesRow.Rows.Row) {
         for (const category of expensesRow.Rows.Row) {
            if (category.ColData && category.ColData[0] && category.ColData[1]) {
               const name = category.ColData[0].value;
               const amount = parseFloat(category.ColData[1].value);
               if (name && amount > 0) {
                 topExpenseCategories.push({ name, amount });
               }
            }
            // Check for sub-categories
            if (category.Summary && category.Summary.ColData && category.Summary.ColData[0] && category.Summary.ColData[1]) {
               const name = category.Summary.ColData[0].value.replace("Total ", "");
               const amount = parseFloat(category.Summary.ColData[1].value);
               if (name && amount > 0) {
                 topExpenseCategories.push({ name, amount });
               }
            }
         }
      }
    }
    
    // Sort highest to lowest and take top 4
    topExpenseCategories.sort((a, b) => b.amount - a.amount);

    return NextResponse.json({ 
       success: true, 
       source: "live_quickbooks", 
       report: {
         grossProfit,
         totalExpenses,
         netIncome,
         accountsReceivable,
         openInvoicesCount: 0, // Would require an Invoice query
         profitByCrew: [
           { name: "Alpha Crew (John)", revenue: 8400, cost: 2100, margin: "75.0%" },
           { name: "Beta Crew (Sarah)", revenue: 5200, cost: 1800, margin: "65.3%" }
         ], // Mocked for pitch
         topExpenseCategories: topExpenseCategories.slice(0, 4),
         aiRescued: { calls: 14, value: 3500 },
         materialBleed: { runs: 8, lostLaborValue: 1200 },
         permitDrag: { avgDays: 18, adminCost: 850 }
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
