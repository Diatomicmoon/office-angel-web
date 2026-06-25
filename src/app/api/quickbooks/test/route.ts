import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { qbFetch } from "@/lib/quickbooks";

export const dynamic = "force-dynamic";

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

  // Get the tokens from the DB
  const { data: company, error } = await supabase
    .from("companies")
    .select("quickbooks_access_token, quickbooks_realm_id, quickbooks_token_expires_at")
    .eq("id", companyId)
    .single();

  // Fetch Canvassing Leaderboard here as well to inject into the Financials page
  let canvassingLeaderboard: any[] = [];
  const { data: visits } = await supabase
    .from('canvassing_visits')
    .select('*')
    .eq('company_id', companyId);

  if (visits && visits.length > 0) {
    const repCounts: Record<string, { knocks: number, hot: number }> = {};
    for (const v of visits) {
      const rep = v.rep_name || "Sales Rep"; 
      if (!repCounts[rep]) repCounts[rep] = { knocks: 0, hot: 0 };
      repCounts[rep].knocks++;
      if (v.interest_level === 'hot') repCounts[rep].hot++;
    }
    canvassingLeaderboard = Object.entries(repCounts)
      .map(([name, data]) => ({ name, knocks: data.knocks, hot: data.hot }))
      .sort((a, b) => b.knocks - a.knocks);
  }

  if (error || !company || !company.quickbooks_access_token) {
    // Fallback to internal invoices if QuickBooks is not connected
    const { data: invoices } = await supabase.from('invoices').select('*').eq('company_id', companyId);
    let grossProfit = 0;
    let accountsReceivable = 0;
    
    if (invoices) {
      grossProfit = invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);
      accountsReceivable = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue').reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);
    }

    const { data: calls } = await supabase.from("call_logs").select("id").eq("company_id", companyId).eq("urgency_flag", "high");
    const rescuedCalls = calls ? calls.length : 0;
    const rescuedValue = rescuedCalls * 150;

    const { data: receipts } = await supabase.from("receipts").select("id").eq("company_id", companyId).or('supplier_name.ilike.%home depot%,supplier_name.ilike.%lowe%');
    const materialRuns = receipts ? receipts.length : 0;
    const lostLaborValue = materialRuns * 150;

    return NextResponse.json({ 
       success: true, 
       source: "internal_invoices",
       canvassingLeaderboard,
       report: {
         grossProfit,
         totalExpenses: 0,
         netIncome: grossProfit,
         accountsReceivable,
         openInvoicesCount: invoices?.filter((i: any) => i.status === 'pending').length || 0,
         profitByCrew: [], 
         topExpenseCategories: [],
         aiRescued: { calls: rescuedCalls, value: rescuedValue },
         materialBleed: { runs: materialRuns, lostLaborValue: lostLaborValue },
         permitDrag: { avgDays: 0, adminCost: 0 }
       }
    }, { status: 200 });
  }

  // Intuit Sandbox Base URL
  const sandboxBaseUrl = "https://sandbox-quickbooks.api.intuit.com";
  const realmId = company.quickbooks_realm_id;
  const token = company.quickbooks_access_token;

  try {
    // 1. Profit & Loss
    const plUrl = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?date_macro=This Month-to-date&minorversion=70`;
    const plRes = await fetch(plUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });
    
    if (!plRes.ok) {
       const errText = await plRes.text();
       return NextResponse.json({ error: "QuickBooks API Error (Token likely expired)", details: errText, canvassingLeaderboard }, { status: plRes.status });
    }
    const plData = await plRes.json();

    // 2. Aged Receivables
    const arUrl = `${sandboxBaseUrl}/v3/company/${realmId}/reports/AgedReceivable?minorversion=70`;
    const arRes = await fetch(arUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    });
    const arData = arRes.ok ? await arRes.json() : null;

    // Parser functions
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

    const topExpenseCategories: any[] = [];
    if (plData.Rows && plData.Rows.Row) {
      const expensesRow = plData.Rows.Row.find((r: any) => r.Summary && r.Summary.ColData && r.Summary.ColData[0] && r.Summary.ColData[0].value.includes("Total Expenses"));
      if (expensesRow && expensesRow.Rows && expensesRow.Rows.Row) {
         for (const category of expensesRow.Rows.Row) {
            if (category.ColData && category.ColData[0] && category.ColData[1]) {
               const name = category.ColData[0].value;
               const amount = parseFloat(category.ColData[1].value);
               if (name && amount > 0) topExpenseCategories.push({ name, amount });
            }
            if (category.Summary && category.Summary.ColData && category.Summary.ColData[0] && category.Summary.ColData[1]) {
               const name = category.Summary.ColData[0].value.replace("Total ", "");
               const amount = parseFloat(category.Summary.ColData[1].value);
               if (name && amount > 0) topExpenseCategories.push({ name, amount });
            }
         }
      }
    }
    topExpenseCategories.sort((a, b) => b.amount - a.amount);

    const { data: calls } = await supabase.from("call_logs").select("id").eq("company_id", companyId).eq("urgency_flag", "high");
    const rescuedCalls = calls ? calls.length : 0;
    const rescuedValue = rescuedCalls * 150;

    const { data: receipts } = await supabase.from("receipts").select("id").eq("company_id", companyId).or('supplier_name.ilike.%home depot%,supplier_name.ilike.%lowe%');
    const materialRuns = receipts ? receipts.length : 0;
    const lostLaborValue = materialRuns * 150;

    return NextResponse.json({ 
       success: true, 
       source: "live_quickbooks", 
       canvassingLeaderboard,
       report: {
         grossProfit,
         totalExpenses,
         netIncome,
         accountsReceivable,
         openInvoicesCount: 0,
         profitByCrew: [], 
         topExpenseCategories: topExpenseCategories.slice(0, 4),
         aiRescued: { calls: rescuedCalls, value: rescuedValue },
         materialBleed: { runs: materialRuns, lostLaborValue: lostLaborValue },
         permitDrag: { avgDays: 0, adminCost: 0 }
       },
       raw: { pl: plData, ar: arData }
    });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
