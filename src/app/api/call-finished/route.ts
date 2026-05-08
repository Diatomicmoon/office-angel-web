import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function normalizeTranscript(t: any) {
  if (!t) return null;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') {
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? parsed : t;
    } catch {
      return t;
    }
  }
  return t;
}

function deriveUrgency(summary?: string) {
  const s = (summary || '').toLowerCase();
  if (s.match(/(emergency|sparking|fire|smoke|burning smell|burning|arcing|arc|shock|electrocution|power out|no power|flood|gas)/)) return 'high';
  if (s.match(/(breaker tripping|tripping|flicker|flickering|panel upgrade|estimate|quote|outlet)/)) return 'medium';
  return 'low';
}

function deriveActionItems(summary?: string, urgency?: string) {
  if (urgency === 'high') return 'Dispatch emergency technician immediately';
  const s = (summary || '').toLowerCase();
  if (s.includes('quote') || s.includes('estimate')) return 'Schedule estimate / site visit';
  if (s.includes('invoice') || s.includes('past due') || s.includes('overdue')) return 'Follow up on invoice / collect payment';
  return 'Requires review';
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    console.log('\n=============================================');
    console.log('🚨 [VAPI WEBHOOK] CALL FINISHED 🚨');
    console.log('=============================================');
    
    if (payload.message && payload.message.type === 'end-of-call-report') {
      const call = payload.message.call;
      const summary = payload.message.summary;
      const transcript = normalizeTranscript(payload.message.transcript);
      const phoneNumber = call?.customer?.number || 'Unknown';
      const durationSeconds = call?.duration || 0;
      const providerCallId = call?.id || call?.callId || payload?.message?.callId;
      const recordingUrl = call?.recordingUrl || payload?.message?.recordingUrl;
      
      console.log(`📞 Caller ID: ${phoneNumber}`);
      console.log(`⏱️ Duration: ${durationSeconds} seconds`);
      console.log(`📝 Summary:`, summary);

      // Connect to Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Scope writes to a specific company so demo + local can share a Supabase project safely.
      let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
      if (!companyId) {
        const { data: c0 } = await supabase
          .from('companies')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(1);
        companyId = c0?.[0]?.id;
      }

      if (!companyId) {
        console.error('No company available; refusing to write call log. Set OFFICE_ANGEL_COMPANY_ID or create a company.');
        return NextResponse.json({ success: false, error: 'No company configured.' }, { status: 500 });
      }

      // 1. Find or create the customer based on phone number
      let customerId = null;
      if (phoneNumber !== 'Unknown') {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('company_id', companyId)
          .eq('phone_number', phoneNumber)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: cErr } = await supabase
            .from('customers')
            .insert([{ company_id: companyId, phone_number: phoneNumber, first_name: 'New', last_name: 'Caller' }])
            .select()
            .single();
          
          if (!cErr && newCustomer) {
            customerId = newCustomer.id;
          }
        }
      }

      // 2. Heuristic urgency + action items (LLM later)
      const urgencyFlag = deriveUrgency(summary);
      const actionItems = deriveActionItems(summary, urgencyFlag);

      // 3. Save the call log to Supabase
      const baseRow: any = {
        company_id: companyId,
        customer_id: customerId,
        call_status: 'completed',
        duration_seconds: durationSeconds,
        transcript: transcript,
        summary: summary,
        urgency_flag: urgencyFlag,
        action_items: actionItems,
        recording_url: recordingUrl,
        meta: {
          provider: 'vapi',
          provider_call_id: providerCallId,
        },
      };

      let { error: logErr } = await supabase
        .from('call_logs')
        .insert([baseRow]);

      // If the DB migration hasn't been applied yet, retry without the new optional columns.
      if (logErr && (String(logErr.message || '').includes('recording_url') || String(logErr.message || '').includes('meta'))) {
        const fallbackRow = { ...baseRow };
        delete fallbackRow.recording_url;
        delete fallbackRow.meta;
        ({ error: logErr } = await supabase.from('call_logs').insert([fallbackRow]));
      }

      if (logErr) {
        console.error("Error saving call to DB:", logErr);
      } else {
        console.log("✅ Call saved to Supabase successfully!");
      }

    } else {
      console.log('Received raw payload (not end-of-call):');
      console.log(payload?.message?.type || 'Unknown type');
    }
    
    console.log('=============================================\n');

    return NextResponse.json({ success: true, message: "Webhook processed." });
  } catch (error) {
    console.error("[WEBHOOK ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 });
  }
}
