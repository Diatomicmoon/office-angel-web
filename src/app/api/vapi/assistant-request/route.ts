import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[VAPI] Assistant Request Payload:", JSON.stringify(body, null, 2));

    const message = body.message;
    if (!message || message.type !== 'assistant-request') {
      return NextResponse.json({ error: 'Invalid webhook type' }, { status: 400 });
    }

    const callDetails = message.call;
    const customerPhoneNumber = callDetails.customer?.number;
    const systemPhoneNumber = callDetails.system?.number;

    if (!systemPhoneNumber) {
       console.error("[VAPI] No system phone number found in Vapi payload");
       return NextResponse.json({ error: 'Missing system phone number' }, { status: 400 });
    }

    console.log(`[VAPI] Incoming call to: ${systemPhoneNumber} from ${customerPhoneNumber}`);

    // Lookup the company
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('phone_number', systemPhoneNumber)
      .single();

    if (error || !company) {
      console.error(`[VAPI] Company not found for phone number: ${systemPhoneNumber}`);
      return NextResponse.json({
         assistant: {
           model: {
             provider: "openai",
             model: "gpt-4o",
             messages: [
               {
                 role: "system",
                 content: "You are an answering service. Please take a message and let them know someone will call them back."
               }
             ]
           },
           voice: {
             provider: "openai",
             voiceId: "alloy"
           },
           firstMessage: "Thanks for calling. How can I help you today?"
         }
      });
    }

    const systemPrompt = `You are an expert dispatcher and CSR for ${company.name}. 
Your job is to answer the phone, get the customer's name, address, and the reason they are calling.
Be polite, professional, and concise.

COMPANY INFORMATION:
Name: ${company.name}
Business Hours: 8:00 AM to 5:00 PM

INSTRUCTIONS:
1. Greet the customer: "Thanks for calling ${company.name}, how can I help you today?"
2. Collect their name, address, and the issue.
3. If they need an appointment, use the 'check_availability' tool to find a time, then use the 'book_appointment' tool to schedule them.
4. Tell them you will have a technician reach out shortly to confirm the schedule.
5. End the call politely.`;

    const serverUrl = "https://www.office-angel.com/api/vapi/tools";

    return NextResponse.json({
      assistant: {
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "check_availability",
                description: "Check availability for an appointment or service call.",
                parameters: {
                  type: "object",
                  properties: {
                    date: {
                      type: "string",
                      description: "The date to check availability for, in YYYY-MM-DD format."
                    }
                  },
                  required: ["date"]
                }
              },
              server: {
                url: serverUrl
              }
            },
            {
              type: "function",
              function: {
                name: "book_appointment",
                description: "Book an appointment directly onto the company dashboard.",
                parameters: {
                  type: "object",
                  properties: {
                    customer_name: { type: "string" },
                    customer_phone: { type: "string" },
                    address: { type: "string" },
                    issue_description: { type: "string" },
                    scheduled_time: { type: "string", description: "ISO string of the scheduled time" }
                  },
                  required: ["customer_name", "customer_phone", "address", "issue_description", "scheduled_time"]
                }
              },
              server: {
                url: serverUrl
              }
            }
          ]
        },
        voice: {
          provider: "openai",
          voiceId: "alloy"
        },
        firstMessage: `Thanks for calling ${company.name}, how can I help you today?`
      }
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
