import { NextRequest, NextResponse } from "next/server";
import { getContact, getContactOpportunities, normalizeContact, GHL_STAGE_MAP } from "@/lib/ghl";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) {
    return NextResponse.json({ error: "GHL credentials not configured." }, { status: 500 });
  }

  try {
    const [contactRes, opportunities] = await Promise.all([
      getContact(params.id),
      getContactOpportunities(params.id),
    ]);

    const contact = normalizeContact(contactRes.contact || contactRes);

    // Find the most recent open opportunity and its pipeline stage
    const openOpp = opportunities.find((o: any) => o.status === "open") || opportunities[0];
    const pipelineStage = openOpp?.pipelineStageId
      ? GHL_STAGE_MAP[openOpp.pipelineStageId] || "Unknown Stage"
      : null;
    const opportunityValue = openOpp?.monetaryValue || null;
    const opportunityStatus = openOpp?.status || null;

    const res = NextResponse.json({
      contact: {
        ...contact,
        pipelineStage,
        opportunityValue,
        opportunityStatus,
        opportunityCount: opportunities.length,
      },
    });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (err: any) {
    console.error("[GHL Contact Detail]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
