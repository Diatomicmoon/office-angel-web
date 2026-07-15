import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extract lead data from Vapi / GHL webhook payload
    // Vapi payload structure usually has message.call or message.customer
    const leadData = {
      customerName: body.message?.customer?.name || body.name || "Unknown",
      phone: body.message?.customer?.number || body.phone || "Unknown",
      summary: body.message?.call?.summary || body.summary || "No summary provided",
      source: body.source || "vapi_webhook"
    };

    console.log("🚨 New Inbound Lead Received:", leadData);

    // 2. Trigger the Ghost Dispatcher TaskFlow
    // (If OpenClaw is running on the same server, we can trigger it directly. 
    // Otherwise, we insert this into Supabase and OpenClaw picks it up from the queue).
    // import { runGhostDispatcher } from '../../../../../workflows/ghost-dispatcher';
    // await runGhostDispatcher(req, leadData);

    return NextResponse.json({ 
      success: true, 
      message: "Lead ingested, Ghost Dispatcher triggered",
      lead: leadData
    });

  } catch (error) {
    console.error("Error processing inbound lead:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
