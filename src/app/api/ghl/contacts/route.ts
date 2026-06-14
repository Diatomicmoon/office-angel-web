import { NextRequest, NextResponse } from "next/server";
import { getContacts, normalizeContact } from "@/lib/ghl";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // GoHighLevel is currently hardcoded globally to Christian's account in Vercel ENV.
  // Until OAuth multi-tenant is built, hide CRM contacts for all other companies.
  if (companyId !== "8e53126d-d9a7-414c-8291-8657fbf43123") {
    return NextResponse.json({ contacts: [], total: 0, nextPageUrl: null, startAfter: null, startAfterId: null });
  }

  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: "GHL credentials not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "20");
  const query = searchParams.get("query") || "";
  const startAfter = searchParams.get("startAfter") || "";
  const startAfterId = searchParams.get("startAfterId") || "";

  try {
    const data = await getContacts({ limit, query, startAfter, startAfterId });
    const res = NextResponse.json({
      contacts: (data.contacts || []).map(normalizeContact),
      total: data.meta?.total || 0,
      nextPageUrl: data.meta?.nextPageUrl || null,
      startAfter: data.meta?.startAfter || null,
      startAfterId: data.meta?.startAfterId || null,
    });
    // Cache for 60s on CDN, serve stale for up to 5min while revalidating
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (err: any) {
    console.error("[GHL Contacts]", err);
    return NextResponse.json({ error: err.message || "Failed to fetch GHL contacts." }, { status: 500 });
  }
}
