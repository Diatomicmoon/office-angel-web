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

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const name = String(payload?.name || '').trim();
    const phone = String(payload?.phone || '').trim();
    const message = String(payload?.message || '').trim();
    const address = String(payload?.address || '').trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let companyId: string | null = process.env.OFFICE_ANGEL_COMPANY_ID || null;
    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id || null;
    }
    if (!companyId) return NextResponse.json({ ok: false, error: 'No company configured' }, { status: 500 });

    // Upsert customer by phone if provided
    let customerId: string | null = null;
    if (phone) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id, first_name')
        .eq('company_id', companyId)
        .eq('phone_number', phone)
        .maybeSingle();

      if (existing?.id) {
        customerId = existing.id;
      } else {
        const parts = name.split(' ').filter(Boolean);
        const first_name = parts[0] || 'New';
        const last_name = parts.slice(1).join(' ') || 'Caller';
        const { data: created } = await supabase
          .from('customers')
          .insert([{ company_id: companyId, phone_number: phone, first_name, last_name, address: address || null }])
          .select('id')
          .single();
        customerId = created?.id || null;
      }
    }

    const text = [message, address].filter(Boolean).join('\n');
    const urgencyFlag = deriveUrgency(text);
    const estimatedMinutes = heuristicDurationMinutes(text);
    const title = urgencyFlag === 'high' ? 'Emergency Web Message' : 'Website Message';
    const suggestedStart = suggestStartTime(urgencyFlag);
    const suggestedEnd = new Date(suggestedStart.getTime() + estimatedMinutes * 60000);

    await supabase.from('jobs').insert([
      {
        company_id: companyId,
        customer_id: customerId,
        title,
        status: 'Lead',
        address: address || null,
        priority: urgencyFlag === 'high' ? 'high' : urgencyFlag === 'low' ? 'low' : 'normal',
        estimated_minutes: estimatedMinutes,
        scheduled_start: suggestedStart.toISOString(),
        scheduled_end: suggestedEnd.toISOString(),
        notes: message || null,
      } as any,
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[INBOUND WEB] error', e);
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 });
  }
}

