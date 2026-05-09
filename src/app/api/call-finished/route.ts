import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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

function deriveUrgency(text?: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(emergency|sparking|spark|fire|smoke|smoking|burning smell|burning|burn|arcing|arc|shock|electrocution|power out|no power|flood|gas|smell|smell of|outlet burning|burning outlet)/)) return 'high';
  if (s.match(/(breaker tripping|tripping|trip|flicker|flickering|panel upgrade|estimate|quote|outlet|power loss|power outage)/)) return 'medium';
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
    console.log('RAW PAYLOAD KEYS:', JSON.stringify(Object.keys(payload), null, 2));
    console.log('MESSAGE TYPE:', payload?.message?.type);
    console.log('FULL PAYLOAD:', JSON.stringify(payload, null, 2));
    
    if (payload.message && payload.message.type === 'end-of-call-report') {
      const call = payload.message.call;
      // Handle both payload.message.summary and payload.message.artifact.summary
      const summary = payload.message.summary || payload.message.artifact?.summary || payload.message.analysis?.summary;
      const transcript = normalizeTranscript(
        payload.message.transcript ||
        payload.message.artifact?.transcript ||
        payload.message.artifact?.transcriptObject
      );
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

      // 2. Auto-generate summary from transcript if Vapi didn't send one
      let finalSummary = summary;
      if (!finalSummary && transcript) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const transcriptText = Array.isArray(transcript)
            ? transcript.map((t: any) => `${t.speaker || t.role}: ${t.text || t.message}`).join('\n')
            : String(transcript);
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'user',
              content: `You are an AI dispatcher assistant. Summarize this call transcript in 2-3 sentences. Include: caller name, address, job type, issue description, and urgency level.\n\nTranscript:\n${transcriptText}`
            }],
            max_tokens: 200,
          });
          finalSummary = completion.choices[0]?.message?.content || null;
        } catch (e) {
          console.error('OpenAI summary error:', e);
        }
      }

      // 3. Heuristic urgency + action items
      const urgencyText = (finalSummary || '') + ' ' + (Array.isArray(transcript) ? transcript.map((t: any) => t.text || t.message || '').join(' ') : String(transcript || ''));
      const urgencyFlag = deriveUrgency(urgencyText);
      const actionItems = deriveActionItems(finalSummary, urgencyFlag);

      // 3. Save the call log to Supabase
      const baseRow: any = {
        company_id: companyId,
        customer_id: customerId,
        call_status: 'completed',
        duration_seconds: durationSeconds,
        transcript: transcript,
        summary: finalSummary,
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
