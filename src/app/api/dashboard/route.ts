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

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Company scoping: keep demo + local separated even if they share the same Supabase project.
  // Priority: env var -> first company in DB.
  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data: c0 } = await supabase
      .from("companies")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1);
    companyId = c0?.[0]?.id;
  }

  if (!companyId) {
    return NextResponse.json({ calls: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 }, technicians: [], actionItems: [], techTableAvailable: true });
  }

  // Fetch company config for QB status
  const { data: companyData } = await supabase
    .from("companies")
    .select("quickbooks_realm_id")
    .eq("id", companyId)
    .single();
  const qbConnected = !!companyData?.quickbooks_realm_id;

  // Fetch calls
  const { data: calls, error: callsErr } = await supabase
    .from("call_logs")
    .select("*, customers(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (callsErr || !calls) return NextResponse.json({ calls: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 }, technicians: [], actionItems: [] });

  // Fetch technicians (optional table; safe-fail if it doesn't exist yet)
  const { data: technicians, error: techErr } = await supabase
    .from("technicians")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  const safeTechnicians = techErr ? [] : (technicians || []);
  const techTableAvailable = !techErr;

  // Fetch receipts needing action (optional)
  const { data: receipts, error: receiptsErr } = await supabase
    .from("receipts")
    .select("id, supplier_name, total_amount, status, created_at")
    .eq("company_id", companyId)
    .eq("status", "Action Required")
    .order("created_at", { ascending: false })
    .limit(5);

  const safeReceipts = receiptsErr ? [] : (receipts || []);

  // Fetch permits needing action (optional)
  const { data: permits, error: permitsErr } = await supabase
    .from("permits")
    .select("id, municipality, permit_number, status, created_at")
    .eq("company_id", companyId)
    .neq("status", "Final Passed")
    .order("created_at", { ascending: false })
    .limit(5);

  const safePermits = permitsErr ? [] : (permits || []);

  // Calculate stats
  const totalCalls = calls.length;
  const emergencies = calls.filter(c => c.urgency_flag === "high").length;
  
  // Also fetch Jobs to see what's scheduled
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("status")
    .eq("company_id", companyId);
    
  const autoScheduledCount = (allJobs || []).filter(j => j.status === "Scheduled").length;

  // Also fetch all Receipts to calculate material costs (Financial Pulse proxy)
  const { data: allReceipts } = await supabase
    .from("receipts")
    .select("total_amount")
    .eq("company_id", companyId);
    
  const totalMaterialSpend = (allReceipts || []).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);

  // Missed calls rescued value (mock calculation: $150 pipeline value per call handled)
  const rescuedValue = totalCalls * 150;
  
  // Calculate estimated revenue (proxy: 4x material spend if QB connected, else null)
  const estimatedRevenue = qbConnected ? totalMaterialSpend * 4 : null;

  // Build action items list
  const actionItemsOut: ActionItem[] = [];

  // 1) Calls with action items / urgency
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

  // 2) Receipts needing action
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

  // 3) Permits not finalized
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
    actionItems: actionItemsOut.slice(0, 8),
    stats: {
      totalCalls,
      emergencies,
      actionItemsCount: actionItemsOut.length,
      autoScheduledCount,
      rescuedValue,
      totalMaterialSpend,
      estimatedRevenue,
      qbConnected
    }
  });
}
