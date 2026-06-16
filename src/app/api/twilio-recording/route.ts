import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fetch from 'node-fetch'; // or use native fetch if available
import fs from 'fs';
import os from 'os';
import path from 'path';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const params = new URLSearchParams(textBody);
    
    const recordingUrl = params.get('RecordingUrl');
    const callSid = params.get('CallSid');
    const fromPhone = params.get('From');
    const toPhone = params.get('To');
    
    console.log(`[TWILIO RECORDING] Received recording for call ${callSid}. URL: ${recordingUrl}`);
    
    if (!recordingUrl) {
      return NextResponse.json({ success: true, message: 'No recording url' });
    }

    // 1. Find the company by phone number
    const { data: company } = await supabase()
      .from('companies')
      .select('id, name')
      .eq('phone_number', toPhone)
      .single();
      
    if (!company) {
      console.warn(`[TWILIO RECORDING] No company found for To phone: ${toPhone}`);
      return NextResponse.json({ success: true }); // Acknowledge Twilio
    }
    const companyId = company.id;

    // 2. Download the audio file from Twilio
    // Twilio provides the recording at RecordingUrl. Append .mp3 for smaller payload.
    const mediaUrl = `${recordingUrl}.mp3`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const mediaRes = await fetch(mediaUrl, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!mediaRes.ok) {
       console.error("[TWILIO RECORDING] Failed to download audio:", mediaRes.status, mediaRes.statusText);
       return NextResponse.json({ success: false }, { status: 500 });
    }
    
    const arrayBuffer = await mediaRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to temp file for Whisper
    const tmpFilePath = path.join(os.tmpdir(), `${callSid}.mp3`);
    fs.writeFileSync(tmpFilePath, buffer);
    
    // 3. Transcribe with Whisper
    console.log(`[TWILIO RECORDING] Transcribing ${callSid}...`);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFilePath) as any,
      model: "whisper-1",
      language: "en"
    });
    
    const transcriptText = transcription.text;
    console.log(`[TWILIO RECORDING] Transcript:`, transcriptText);
    
    // Cleanup temp file
    fs.unlinkSync(tmpFilePath);

    // 4. Summarize and Extract Job Info using GPT-4o
    const prompt = `You are a dispatcher assistant analyzing a recorded phone call between a customer and a dispatcher.
Transcript:
"${transcriptText}"

Please extract the following details. If a detail is not mentioned, return null.
Return ONLY valid JSON.
{
  "summary": "A 1-2 sentence summary of what the customer needs.",
  "customer_name": "Full name if provided",
  "customer_address": "Street address if provided",
  "issue": "Specific electrical or plumbing issue",
  "urgency": "low, medium, or high (e.g. emergency, no power)",
  "create_job": boolean (true if this seems like a real job request/lead, false if spam/wrong number)
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" }
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // 5. Save Call Log
    const { data: callLog, error: logErr } = await supabase()
      .from('call_logs')
      .insert([{
        company_id: companyId,
        customer_phone: fromPhone,
        customer_name: analysis.customer_name || 'Unknown Caller',
        call_status: 'completed',
        summary: analysis.summary || transcriptText,
        transcript: transcriptText,
        recording_url: mediaUrl,
        urgency_flag: analysis.urgency || 'low',
        action_items: 'Follow up required'
      }])
      .select()
      .single();

    // 6. Create Job if valid
    if (analysis.create_job) {
       await supabase()
        .from('jobs')
        .insert([{
          company_id: companyId,
          title: `[Co-Pilot] ${analysis.issue || 'Service Call'}`,
          description: analysis.summary,
          status: 'needs_schedule',
          priority: analysis.urgency === 'high' ? 'high' : 'medium',
          address: analysis.customer_address || null
        }]);
    }

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('[TWILIO RECORDING] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
