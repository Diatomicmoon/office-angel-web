import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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
    let systemPhoneNumberRaw = callDetails?.system?.number || message.phoneNumber?.number;
    // Clean SIP URI if present (e.g. sip:+16123245110@sip.vapi.ai -> +16123245110)
    let systemPhoneNumber = systemPhoneNumberRaw;
    if (systemPhoneNumberRaw && systemPhoneNumberRaw.includes('sip:')) {
      const match = systemPhoneNumberRaw.match(/sip:([^@]+)@/);
      if (match) systemPhoneNumber = match[1];
    }

    if (!systemPhoneNumber) {
       console.error("[VAPI] No system phone number found in Vapi payload. Full payload:", JSON.stringify(body, null, 2));
       return NextResponse.json({ error: 'Missing system phone number' }, { status: 400 });
    }

    console.log(`[VAPI] Incoming call to: ${systemPhoneNumber} from ${customerPhoneNumber}`);

    // Lookup the company
    const { data: company, error } = await supabase()
      .from('companies')
      .select('*')
      .eq('phone_number', systemPhoneNumber)
      .single();

    
    // Log the incoming call so the dashboard "Active Call" banner works
    if (company) {
      await supabase().from('call_logs').insert([{
        company_id: company.id,
        call_status: 'incoming',
        meta: {
          phone: customerPhoneNumber,
          provider: 'vapi',
          lookup_name: 'Unknown Caller'
        }
      }]);
    }
  
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
