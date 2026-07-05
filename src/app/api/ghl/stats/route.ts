import { NextResponse } from "next/server";
import { getContacts } from "@/lib/ghl";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export async function GET() {
  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // GoHighLevel is currently hardcoded globally to Christian's account in Vercel ENV.
  // Until OAuth multi-tenant is built, hide CRM stats for all other companies.
  if (companyId !== "8e53126d-d9a7-414c-8291-8657fbf43123") {
    return NextResponse.json({ error: "GHL not connected for this tenant." }, { status: 403 });
  }

  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: "GHL credentials not configured." }, { status: 500 });
  }

  try {
    // Fetch a small slice just to get the total count and recent leads
    const data = await getContacts({ limit: 5 });
    const total = data.meta?.total || 0;
    const recent = (data.contacts || []).filter((c: any) => {
      if (!c.dateAdded) return false;
      const daysSince = (Date.now() - new Date(c.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    return NextResponse.json({
      totalLeads: total,
      recentLeads: recent,
      locationId: process.env.GHL_LOCATION_ID,
    });
  } catch (err: any) {
    console.error("[GHL Stats]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
