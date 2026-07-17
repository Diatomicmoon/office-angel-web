import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ActionItem = {
  id: string;
  type: "call" | "receipt" | "permit";
  priority: "high" | "medium" | "low";
  title: string;
  description?: string;
  href?: string;
  created_at?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  let companyId;
  let userId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
    userId = res.userId;
  } catch (err) {
    console.error("Dashboard auth error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!companyId) {
    return NextResponse.json({ calls: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 }, technicians: [], actionItems: [], techTableAvailable: true });
  }

  const { data: companyData } = await supabase
    .from("companies")
    .select("name, quickbooks_realm_id, quickbooks_access_token")
    .eq("id", companyId)
    .single();
  const qbConnected = !!companyData?.quickbooks_realm_id;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", userId)
    .single();

  const { data: memData } = await supabase
    .from("company_memberships")
    .select("role")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  const userRole = memData?.role || profileData?.role || 'user';

  let qbGrossProfit = 0;
  let qbTotalExpenses = 0;
  let qbNetIncome = 0;
  let qbError = null;

  if (qbConnected && companyData?.quickbooks_access_token) {
    try {
      const sandboxBaseUrl = "https://sandbox-quickbooks.api.intuit.com";
      const realmId = companyData.quickbooks_realm_id;
      const url = `${sandboxBaseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?minorversion=70`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${companyData.quickbooks_access_token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const reportData = await response.json();
        
        const findTotal = (rows: any[], name: string): number | null => {
          if (!rows) return null;
          for (const r of rows) {
            if (r.Summary && r.Summary.ColData && r.Summary.ColData[0] && (r.Summary.ColData[0].value === name || r.Summary.ColData[0].value.includes(name))) {
               return parseFloat(r.Summary.ColData[1].value) || 0;
            }
            if (r.ColData && r.ColData[0] && (r.ColData[0].value === name || r.ColData[0].value.includes(name))) {
               return parseFloat(r.ColData[1].value) || 0;
            }
            if (r.Rows && r.Rows.Row) {
               const found = findTotal(r.Rows.Row, name);
               if (found !== null) return found;
            }
          }
          return null;
        };

        if (reportData.Rows && reportData.Rows.Row) {
           qbGrossProfit = findTotal(reportData.Rows.Row, "Gross Profit") || 0;
           qbTotalExpenses = findTotal(reportData.Rows.Row, "Total Expenses") || 0;
           qbNetIncome = findTotal(reportData.Rows.Row, "Net Income") || findTotal(reportData.Rows.Row, "Net Operating Income") || 0;
        }
      } else {
        qbError = "Auth Expired";
        qbGrossProfit = 0;
        qbTotalExpenses = 0;
        qbNetIncome = 0;
      }
    } catch (err: any) {
      qbError = err.message;
      qbGrossProfit = 0;
      qbTotalExpenses = 0;
      qbNetIncome = 0;
    }
  } else if (qbConnected) {
     qbError = "Missing Token";
     qbGrossProfit = 0;
     qbTotalExpenses = 0;
     qbNetIncome = 0;
  }

  const { data: calls, error: callsErr } = await supabase
    .from("call_logs")
    .select("*, customers(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (callsErr || !calls) return NextResponse.json({ calls: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 }, technicians: [], actionItems: [] });

  const { data: technicians, error: techErr } = await supabase
    .from("technicians")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  let safeTechnicians = techErr ? [] : (technicians || []);
  if (safeTechnicians.length > 0) {
     const techIds = safeTechnicians.map((t: any) => t.id);
     const { data: allFleetLocations } = await supabase
       .from("fleet_locations")
       .select("technician_id, latitude, longitude, speed, heading, created_at")
       .in("technician_id", techIds);

     safeTechnicians = safeTechnicians.map((t: any) => {
        const fleetData = allFleetLocations?.filter((f: any) => f.technician_id === t.id) || [];
        if (fleetData.length > 0) {
           fleetData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           const latest = fleetData[0];
           
           return {
              ...t,
              last_location: {
                lat: latest.latitude,
                lng: latest.longitude,
                speed: latest.speed,
                heading: latest.heading
              },
              last_location_address: t.last_location_address || `Live: ${latest.latitude.toFixed(3)}, ${latest.longitude.toFixed(3)}`,
              updated_at: new Date(latest.created_at) > new Date(t.updated_at) ? latest.created_at : t.updated_at
           };
        }
        return t;
     });
  }
  const techTableAvailable = !techErr;

  const { data: receipts, error: receiptsErr } = await supabase
    .from("receipts")
    .select("id, supplier_name, total_amount, status, created_at")
    .eq("company_id", companyId)
    .eq("status", "Action Required")
    .order("created_at", { ascending: false })
    .limit(5);

  const safeReceipts = receiptsErr ? [] : (receipts || []);

  const { data: permits, error: permitsErr } = await supabase
    .from("permits")
    .select("id, municipality, permit_number, status, created_at")
    .eq("company_id", companyId)
    .neq("status", "Final Passed")
    .order("created_at", { ascending: false })
    .limit(5);

  const safePermits = permitsErr ? [] : (permits || []);

  const totalCalls = calls.length;
  const emergencies = calls.filter(c => c.urgency_flag === "high").length;
  
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("status")
    .eq("company_id", companyId);
    
  const autoScheduledCount = (allJobs || []).filter(j => j.status === "Scheduled").length;

  const { data: allReceipts } = await supabase
    .from("receipts")
    .select("total_amount")
    .eq("company_id", companyId);
    
  const totalMaterialSpend = (allReceipts || []).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);

  const rescuedValue = totalCalls * 150;
  
  const estimatedRevenue = qbConnected ? totalMaterialSpend * 4 : null;

  // New Canvassing Leaderboard Fetch (for the Financials / General dashboard use)
  let canvassingLeaderboard: any[] = [];
  const { data: visits } = await supabase
    .from('door_knocking_visits')
    .select('*')
    .eq('company_id', companyId);

  let personalStats = { knocks: 0, demos: 0 };
  if (visits && visits.length > 0) {
    const repCounts: Record<string, { knocks: number, hot: number }> = {};
    for (const v of visits) {
      const rep = v.sales_rep_name || "Unknown Rep";
      const isMe = rep.includes(profileData?.first_name || "nobody");
      
      if (!repCounts[rep]) repCounts[rep] = { knocks: 0, hot: 0 };
      repCounts[rep].knocks++;
      if (['hot', 'demo_set', 'contacted'].includes(v.interest_level)) {
        repCounts[rep].hot++;
      }
      
      if (isMe) {
        personalStats.knocks++;
        if (['hot', 'demo_set', 'contacted'].includes(v.interest_level)) personalStats.demos++;
      }
    }
    canvassingLeaderboard = Object.entries(repCounts)
      .map(([name, data]) => ({ name, knocks: data.knocks, hot: data.hot }))
      .sort((a, b) => b.knocks - a.knocks);
  }

  const actionItemsOut: ActionItem[] = [];

  for (const c of calls.slice(0, 10)) {
    const hasAction = c.action_items && String(c.action_items).trim() && String(c.action_items).toLowerCase() !== "none";
    const urgency = (c.urgency_flag || "low") as "high" | "medium" | "low";
    if (!hasAction && urgency !== "high") continue;

    actionItemsOut.push({
      id: `call:${c.id}`,
      type: "call",
      priority: urgency === "high" ? "high" : hasAction ? "medium" : "low",
      title: urgency === "high" ? "Emergency call needs dispatch" : "Call follow-up",
      description: hasAction ? String(c.action_items) : (c.summary || "Review call transcript"),
      href: "/call-logs",
      created_at: c.created_at,
    });
  }

  for (const r of safeReceipts) {
    actionItemsOut.push({
      id: `receipt:${r.id}`,
      type: "receipt",
      priority: "medium",
      title: "Receipt needs mapping",
      description: `${r.supplier_name || "Supplier"}${r.total_amount ? ` • $${r.total_amount}` : ""}`,
      href: "/financials",
      created_at: r.created_at,
    });
  }

  for (const p of safePermits) {
    actionItemsOut.push({
      id: `permit:${p.id}`,
      type: "permit",
      priority: p.status === "Failed" ? "high" : "low",
      title: "Permit status needs attention",
      description: `${p.municipality || "Municipality"}${p.permit_number ? ` • ${p.permit_number}` : ""} • ${p.status}`,
      href: "/projects",
      created_at: p.created_at,
    });
  }

  return NextResponse.json({
    calls,
    technicians: safeTechnicians,
    techTableAvailable,
    canvassingLeaderboard,
    actionItems: actionItemsOut.slice(0, 8),
    user: {
      firstName: profileData?.first_name || null,
      role: userRole,
      personalStats
    },
    company: {
      name: companyData?.name || "Your Company",
    },
    stats: {
      totalCalls,
      emergencies,
      actionItemsCount: actionItemsOut.length,
      autoScheduledCount,
      rescuedValue,
      totalMaterialSpend,
      estimatedRevenue,
      qbConnected,
      qbGrossProfit,
      qbTotalExpenses,
      qbNetIncome,
      qbError
    }
  });
}
