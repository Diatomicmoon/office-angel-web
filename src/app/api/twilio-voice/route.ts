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
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
            ).toString('base64'),
        },
      }
    );
    const data = await res.json();
    const raw = data?.caller_name?.caller_name as string | null;
    if (!raw) return null;
    // Title-case (carrier returns ALL CAPS)
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

    // Lookup caller name from carrier data
    const lookupName = await twilioLookup(callerPhone);
    console.log(`[TWILIO VOICE] Lookup name: ${lookupName || 'unknown'}`);

    // Get company
    let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
    if (!companyId) {
      const { data: c0 } = await sb().from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id;
    }

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
        // Update name if we have a lookup name and they're still "New"
        if (lookupName && (!existing.first_name || existing.first_name === 'New')) {
          const parts = lookupName.split(' ');
          await sb().from('customers').update({
            first_name: parts[0],
            last_name: parts.slice(1).join(' ') || '',
          }).eq('id', existing.id);
        }
      } else if (lookupName) {
        const parts = lookupName.split(' ');
        const { data: newCust } = await sb()
          .from('customers')
          .insert([{
            company_id: companyId,
            phone_number: callerPhone,
            first_name: parts[0],
            last_name: parts.slice(1).join(' ') || '',
          }])
          .select('id')
          .single();
        customerId = newCust?.id || null;
      }

      // Insert an "incoming" call log so the dashboard can show live caller ID
      if (companyId) {
        await sb().from('call_logs').insert([{
          company_id: companyId,
          customer_id: customerId,
          call_status: 'incoming',
          meta: {
            phone: callerPhone,
            lookup_name: lookupName,
            provider: 'twilio',
          },
        }]);
      }
    }

    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('[TWILIO VOICE ERROR]', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong. Please try again.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
