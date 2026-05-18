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
    const conferenceName = formData.get('ConferenceSid') as string | null;

    console.log(`[TWILIO VOICE] Incoming call from ${callerPhone} to ${twilioNumber}`);

    // Resolve company.
    // - In pinned-tenant mode, ALWAYS use OFFICE_ANGEL_COMPANY_ID.
    // - In auth tenant mode, map by inbound "To" number.
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
    // Clean up user input formatting (e.g. "+1 612 598 6260" -> "+16125986260")
    const cleanDigits = rawForwardPhone.replace(/\D/g, "");
    const forwardPhone = cleanDigits ? (cleanDigits.length === 10 ? `+1${cleanDigits}` : `+${cleanDigits}`) : null;

    // Lookup caller name regardless of mode
    const lookupName = await twilioLookup(callerPhone);
    console.log(`[TWILIO VOICE] Lookup: ${lookupName || 'unknown'} | AI enabled: ${aiEnabled}`);

    // Find or create customer
    let customerId: string | null = null;
    if (companyId && callerPhone) {
      const { data: existing } = await sb()
        .from('customers')
        .select('id, first_name')
        .eq('company_id', companyId)
        .eq('phone_number', callerPhone)
        .single();

      if (existing) {
        customerId = existing.id;
        if (lookupName && (!existing.first_name || existing.first_name === 'New')) {
          const parts = lookupName.split(' ');
          await sb().from('customers').update({
            first_name: parts[0],
            last_name: parts.slice(1).join(' ') || '',
          }).eq('id', existing.id);
        }
      } else if (lookupName || callerPhone) {
        const parts = (lookupName || '').split(' ');
        const { data: newCust } = await sb()
          .from('customers')
          .insert([{
            company_id: companyId,
            phone_number: callerPhone,
            first_name: parts[0] || 'New',
            last_name: parts.slice(1).join(' ') || 'Caller',
          }])
          .select('id')
          .single();
        customerId = newCust?.id || null;
      }

      // Save incoming call log for the banner
      if (companyId) {
        const { data: logData } = await sb().from('call_logs').insert([{
          company_id: companyId,
          customer_id: customerId,
          call_status: 'incoming',
          meta: {
            phone: callerPhone,
            lookup_name: lookupName,
            provider: aiEnabled ? 'vapi' : 'copilot',
            ai_enabled: aiEnabled,
          },
        }]).select('id').single();
        if (logData) {
          // We will pass this to conference dialer if needed
          (req as any)._callLogId = logData.id;
        }
      }
    }

    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    
    if (aiEnabled) {
      // ── AI MODE (Auto-Pilot): Forward the call instantly to Vapi via SIP ──
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else if (forwardPhone) {
      // ── CO-PILOT MODE: Conference with human + AI listening silently ──
      // Conference name is unique per call (use caller phone + timestamp)
      const confName = `copilot_${callerPhone.replace(/\D/g, '')}_${Date.now()}`;

      // Call the dispatcher's phone and add them to the conference
      // Also add Vapi as a silent listener via the conference REST API (done async below)
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference 
      startConferenceOnEnter="true"
      endConferenceOnExit="true"
      record="record-from-start"
      recordingStatusCallback="/api/call-finished-recording"
      statusCallback="/api/conference-status"
      statusCallbackEvent="start end join leave"
      waitUrl=""
    >${confName}</Conference>
  </Dial>
</Response>`;

      // Kick off async: dial the dispatcher + add Vapi listener
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.office-angel.com';
      fetch(`${baseUrl}/api/conference-dial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conferenceName: confName,
          dispatcherPhone: forwardPhone,
          vapiAssistantId,
          callerPhone,
          companyId,
          customerId,
          lookupName,
          callLogId: (req as any)._callLogId,
        }),
      }).catch((e) => console.error('conference-dial error:', e));

      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });

    } else {
      // ── CO-PILOT MODE but no forward number set: AI still handles ──
      console.warn('[TWILIO VOICE] AI disabled but no forward_to_phone set — falling back to Vapi');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
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
