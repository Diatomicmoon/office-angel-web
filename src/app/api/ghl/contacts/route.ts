import { NextRequest, NextResponse } from "next/server";
import { getContacts, normalizeContact } from "@/lib/ghl";

export async function GET(req: NextRequest) {
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
