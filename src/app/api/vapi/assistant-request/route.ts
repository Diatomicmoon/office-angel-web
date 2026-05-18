import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi Assistant Request Payload:", JSON.stringify(body, null, 2));

    // The correct Vapi response format for an assistant-request webhook
    return NextResponse.json({
      assistant: {
        firstMessage: "Testing. Testing. One. Two. Three.",
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a polite assistant."
            }
          ]
        },
        voice: {
          provider: "openai",
          voiceId: "alloy"
        }
      }
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
