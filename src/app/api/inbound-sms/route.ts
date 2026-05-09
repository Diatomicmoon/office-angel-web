import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function deriveUrgency(text?: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(emergency|sparking|spark|fire|smoke|smoking|burning smell|burning|burn|arcing|arc|shock|electrocution|power out|no power|flood)/)) return 'high';
  if (s.match(/(breaker tripping|tripping|flicker|panel upgrade|estimate|quote|outlet|power loss|outage)/)) return 'medium';
  return 'low';
}

function heuristicDurationMinutes(text: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(burning|smoke|sparking|arcing|fire|no power|power out|outage)/)) return 120;
  if (s.match(/(panel upgrade|service upgrade|200a|100a|service change)/)) return 480;
  if (s.match(/(ev charger|tesla|charger)/)) return 240;
  if (s.match(/(recessed|can light|lighting install|fixtures)/)) return 180;
  if (s.match(/(breaker tripping|tripping)/)) return 120;
  return 90;
}

function roundUpToNextSlot(d: Date, slotMinutes = 30) {
  const ms = d.getTime();
  const slotMs = slotMinutes * 60 * 1000;
  return new Date(Math.ceil(ms / slotMs) * slotMs);
}

function suggestStartTime(urgencyFlag: string) {
  const bufferMin = urgencyFlag === 'high' ? 0 : urgencyFlag === 'medium' ? 60 : 180;
  return roundUpToNextSlot(new Date(Date.now() + bufferMin * 60000), 30);
}

function twiml(message?: string) {
  const body = message ? `<Message>${String(message).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Message>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const from = String(form.get('From') || '');
    const to = String(form.get('To') || '');
    const body = String(form.get('Body') || '');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Resolve company by inbound "To" number (or fall back to first company / env).
    let companyId: string | null = null;
    if (to) {
      const { data } = await supabase.from('companies').select('id').eq('phone_number', to).limit(1);
      companyId = data?.[0]?.id || null;
    }
    if (!companyId) companyId = process.env.OFFICE_ANGEL_COMPANY_ID || null;
    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id || null;
    }
    if (!companyId) {
      return new NextResponse(twiml('Office Angel is not configured yet.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Upsert customer by phone
    let customerId: string | null = null;
    if (from) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('company_id', companyId)
        .eq('phone_number', from)
        .maybeSingle();

      if (existing?.id) {
        customerId = existing.id;
      } else {
        const { data: created } = await supabase
          .from('customers')
          .insert([{ company_id: companyId, phone_number: from, first_name: 'New', last_name: 'Caller' }])
          .select('id')
          .single();
        customerId = created?.id || null;
      }
    }

    const urgencyFlag = deriveUrgency(body);
    const estimatedMinutes = heuristicDurationMinutes(body);
    const title = urgencyFlag === 'high' ? 'Emergency Text Message' : 'Inbound Text Message';
    const suggestedStart = suggestStartTime(urgencyFlag);
    const suggestedEnd = new Date(suggestedStart.getTime() + estimatedMinutes * 60000);

    // Create job (drops into AI Parking Lot because technician_id is null)
    await supabase.from('jobs').insert([
      {
        company_id: companyId,
        customer_id: customerId,
        title,
        status: 'Lead',
        priority: urgencyFlag === 'high' ? 'high' : urgencyFlag === 'low' ? 'low' : 'normal',
        estimated_minutes: estimatedMinutes,
        scheduled_start: suggestedStart.toISOString(),
        scheduled_end: suggestedEnd.toISOString(),
        // best-effort: store the raw message for now
        notes: body || null,
      } as any,
    ]);

    // No auto-reply for now (keeps it clean). You can enable later.
    return new NextResponse(twiml(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  } catch (e) {
    console.error('[INBOUND SMS] error', e);
    return new NextResponse(twiml(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }
}

