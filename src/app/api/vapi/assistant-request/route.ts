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
    const customerPhoneNumber = callDetails?.customer?.number || message.customer?.number;
    const systemPhoneNumber = callDetails?.system?.number || message.phoneNumber?.number;

    if (!systemPhoneNumber) {
       console.error("[VAPI] No system phone number found in Vapi payload. Full payload:", JSON.stringify(body, null, 2));
       return NextResponse.json({ error: 'Missing system phone number' }, { status: 400 });
    }

    console.log(`[VAPI] Incoming call to: ${systemPhoneNumber} from ${customerPhoneNumber}`);

    // Lookup the company
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('phone_number', systemPhoneNumber)
      .single();

    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (error || !company) {
      console.error(`[VAPI] Company not found for phone number: ${systemPhoneNumber}`);
      return NextResponse.json({
         assistantId: vapiAssistantId,
         assistantOverrides: {
           variableValues: {
             company_name: "our office"
           }
         }
      });
    }

    return NextResponse.json({
      assistantId: vapiAssistantId,
      assistantOverrides: {
        variableValues: {
          company_name: company.name
        }
      }
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
