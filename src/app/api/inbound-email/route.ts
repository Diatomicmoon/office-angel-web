import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Receive the webhook payload (from SendGrid, Postmark, or Mailgun)
    const formData = await req.formData();
    
    const sender = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const textBody = formData.get('text') as string;
    const htmlBody = formData.get('html') as string;
    
    // In production, we will extract PDF attachments here:
    // const attachments = formData.getAll('attachments');

    console.log(`[INBOUND EMAIL] Received from: ${sender}`);
    console.log(`[INBOUND EMAIL] Subject: ${subject}`);

    // 2. Here we will call OpenAI/Claude to parse the textBody/PDF
    // ... AI extraction logic goes here ...

    // 3. Here we will insert the extracted JSON into Supabase `receipts` table
    // ... Supabase insert logic goes here ...

    return NextResponse.json({ success: true, message: "Email received and queued for AI processing." });
  } catch (error) {
    console.error("[INBOUND EMAIL ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to process inbound email webhook" }, { status: 500 });
  }
}
