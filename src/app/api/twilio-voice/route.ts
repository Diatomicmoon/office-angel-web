import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

async function twilioLookup(phone: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}?Fields=caller_name`,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        },
      }
    );
    const data = await res.json();
    const raw = data?.caller_name?.caller_name as string | null;
    if (!raw) return null;
    return raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const callerPhone = formData.get('From') as string;
    const twilioNumber = formData.get('To') as string;

    console.log(`[TWILIO VOICE] Incoming call from ${callerPhone} to ${twilioNumber}`);

    const tenantMode = process.env.OFFICE_ANGEL_TENANT_MODE;
    let companyId: string | undefined = undefined;

    if (tenantMode !== 'auth') {
      companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
    } else if (twilioNumber) {
      const { data: cMatch } = await sb().from('companies').select('id').eq('phone_number', twilioNumber).limit(1);
      companyId = cMatch?.[0]?.id;
    }

    if (!companyId) {
      const { data: c0 } = await sb().from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id;
    }

    const { data: company } = companyId
      ? await sb().from('companies').select('ai_enabled, forward_to_phone').eq('id', companyId).single()
      : { data: null };

    const aiEnabled = company?.ai_enabled !== false; // default ON
    const rawForwardPhone = company?.forward_to_phone || "";
    const cleanDigits = rawForwardPhone.replace(/\D/g, "");
    const forwardPhone = cleanDigits ? (cleanDigits.length === 10 ? `+1${cleanDigits}` : `+${cleanDigits}`) : null;

    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || process.env.VAPI_ASSISTANT_ID;

    if (aiEnabled) {
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      
      if (!vapiAssistantId) {
        console.error('[TWILIO VOICE ERROR] Missing vapiAssistantId in environment variables!');
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Configuration error. Missing AI ID.</Say>
</Response>`;
        return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
      }

      // Format the SIP URI exactly as Vapi expects
      // Vapi SIP requires the format: sip:ASSISTANT_ID@sip.vapi.ai
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai</Sip>
  </Dial>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
      
    } else if (forwardPhone) {
      const confName = `copilot_${callerPhone.replace(/\D/g, '')}_${Date.now()}`;
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true" record="record-from-start" waitUrl="">${confName}</Conference>
  </Dial>
</Response>`;
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.office-angel.com';
      fetch(`${baseUrl}/api/conference-dial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceName: confName,
          dispatcherPhone: forwardPhone,
          vapiAssistantId,
          callerPhone,
          companyId
        }),
      }).catch((e) => console.error('conference-dial error:', e));

      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else {
      console.warn('[TWILIO VOICE] AI disabled but no forward_to_phone set');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. No agents are available to take your call.</Say>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

  } catch (error) {
    console.error('[TWILIO VOICE ERROR]', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
