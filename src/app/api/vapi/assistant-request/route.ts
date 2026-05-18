import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi Assistant Request Payload:", JSON.stringify(body, null, 2));

    // The correct Vapi response format for an assistant-request webhook
    return NextResponse.json({
      assistant: {
        firstMessage: "Thank you for calling. How can I help you today?",
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional and helpful dispatcher for a home services company. You handle incoming calls, take down customer information, and help schedule appointments. Keep your responses concise and natural."
            }
          ]
        },
        voice: {
          provider: "openai",
          voiceId: "echo"
        }
      }
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
