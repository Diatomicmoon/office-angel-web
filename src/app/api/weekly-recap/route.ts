import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
  );

  let companyId: string;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Week window: Monday 00:00 → now
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartISO = weekStart.toISOString();

  // ── Jobs this week ──────────────────────────────────────────────
  const { data: jobsThisWeek } = await supabase
    .from("jobs")
    .select("id, status, title, created_at, customer_name")
    .eq("company_id", companyId)
    .gte("created_at", weekStartISO);

  const totalJobs = (jobsThisWeek || []).length;
  const completedJobs = (jobsThisWeek || []).filter(j =>
    ["completed", "done", "closed", "Completed", "Done", "Closed"].includes(j.status || "")
  ).length;
  const scheduledJobs = (jobsThisWeek || []).filter(j =>
    ["scheduled", "Scheduled"].includes(j.status || "")
  ).length;

  // ── Calls this week ──────────────────────────────────────────────
  const { data: callsThisWeek } = await supabase
    .from("call_logs")
    .select("id, urgency_flag, created_at")
    .eq("company_id", companyId)
    .gte("created_at", weekStartISO);

  const totalCalls = (callsThisWeek || []).length;
  const emergencyCalls = (callsThisWeek || []).filter(c => c.urgency_flag === "high").length;

  // ── Receipts / material spend this week ─────────────────────────
  const { data: receiptsThisWeek } = await supabase
    .from("receipts")
    .select("id, total_amount, supplier_name, created_at")
    .eq("company_id", companyId)
    .gte("created_at", weekStartISO);

  const totalReceipts = (receiptsThisWeek || []).length;
  const materialSpend = (receiptsThisWeek || []).reduce(
    (acc, r) => acc + (Number(r.total_amount) || 0), 0
  );

  // ── Permits this week ────────────────────────────────────────────
  const { data: permitsThisWeek } = await supabase
    .from("permits")
    .select("id, status, municipality, created_at")
    .eq("company_id", companyId)
    .gte("created_at", weekStartISO);

  const totalPermits = (permitsThisWeek || []).length;
  const approvedPermits = (permitsThisWeek || []).filter(p =>
    ["Approved", "Final Passed", "approved"].includes(p.status || "")
  ).length;

  // ── Daily job breakdown (Mon–today) for bar chart ────────────────
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyJobs = Array(7).fill(0);
  const dailyCalls = Array(7).fill(0);

  for (const job of jobsThisWeek || []) {
    const d = new Date(job.created_at);
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    if (idx >= 0 && idx < 7) dailyJobs[idx]++;
  }
  for (const call of callsThisWeek || []) {
    const d = new Date(call.created_at);
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    if (idx >= 0 && idx < 7) dailyCalls[idx]++;
  }

  // ── Week range label ─────────────────────────────────────────────
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`;

  return NextResponse.json({
    weekLabel,
    weekStart: weekStartISO,
    stats: {
      totalJobs,
      completedJobs,
      scheduledJobs,
      totalCalls,
      emergencyCalls,
      totalReceipts,
      materialSpend,
      totalPermits,
      approvedPermits,
    },
    chart: {
      labels: dayLabels,
      jobs: dailyJobs,
      calls: dailyCalls,
    },
    recentJobs: (jobsThisWeek || []).slice(0, 5),
  });
}
