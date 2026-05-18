import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Vapi Payload:", JSON.stringify(body, null, 2));
    
    // Very bare-bones assistant for testing to ensure Vapi accepts the JSON
    return NextResponse.json({
      assistant: {
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Keep your answers brief."
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "pNInz6obpgDQGcFmaJcg" // standard vapi default voice
        },
        firstMessage: "Hello, I am connected."
      }
    });
  } catch (err) {
    console.error("Error processing Vapi webhook:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
