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

      // Transcript: try direct field first, then parse from artifact.messages
      let rawTranscript = payload.message.transcript || payload.message.artifact?.transcript;
      if (!rawTranscript && payload.message.artifact?.messages) {
        // Convert artifact.messages [{role, message}] to our format [{speaker, text}]
        rawTranscript = payload.message.artifact.messages
          .filter((m: any) => m.role === 'bot' || m.role === 'user')
          .map((m: any) => ({ speaker: m.role === 'bot' ? 'AI' : 'User', text: m.message || '' }));
      }
      const transcript = normalizeTranscript(rawTranscript);

      // Structured outputs — try all known Vapi payload locations
      const structuredFromArtifact = payload.message.artifact?.structuredOutputs || 
        payload.message.artifact?.structuredOutput ||
        payload.message.analysis?.structuredData ||
        null;
      const phoneNumber = call?.customer?.number || 'Unknown';
      const durationSeconds = call?.duration || 0;
      const providerCallId = call?.id || call?.callId || payload?.message?.callId;
      const recordingUrl = call?.recordingUrl || payload?.message?.recordingUrl || payload?.message?.artifact?.recordingUrl;
      // Structured outputs — merge all sources
      const structuredOutputs = structuredFromArtifact || null;
      console.log('📊 Structured outputs:', JSON.stringify(structuredOutputs));

      // Parse address + caller name from transcript text as ultimate fallback
      const transcriptText = Array.isArray(transcript)
        ? transcript.map((t: any) => `${t.speaker || t.role}: ${t.text || t.message || ''}`).join('\n')
        : String(transcript || '');
      
      // Simple extraction from transcript if structured outputs missing
      const addressMatch = transcriptText.match(/(?:address is|at)\s+([\d][^.\n]+(?:Street|St|Drive|Dr|Ave|Avenue|Blvd|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)[^.\n]*)/i);
      const parsedAddress = structuredOutputs?.address || (addressMatch ? addressMatch[1].trim() : null);

      const nameMatch = transcriptText.match(/(?:my name is|name'?s?\s+is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      const parsedName = structuredOutputs?.caller_name || (nameMatch ? nameMatch[1].trim() : null);

      const parsedJobType = structuredOutputs?.job_type || null;
      const parsedJobDetails = structuredOutputs?.job_details || null;
      console.log('📍 Parsed address:', parsedAddress, '| 👤 Name:', parsedName);
      
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
          // Extract caller name from structured outputs or transcript parse
          const callerName = parsedName || '';
          const nameParts = callerName.trim().split(' ');
          const firstName = nameParts[0] || 'New';
          const lastName = nameParts.slice(1).join(' ') || 'Caller';
          const address = parsedAddress || null;

          const { data: newCustomer, error: cErr } = await supabase
            .from('customers')
            .insert([{ 
              company_id: companyId, 
              phone_number: phoneNumber, 
              first_name: firstName, 
              last_name: lastName,
              address: address,
            }])
            .select()
            .single();
          
          if (!cErr && newCustomer) {
            customerId = newCustomer.id;
          }
        }

        // Update existing customer with name/address if we now have it from structured outputs
        if (existingCustomer && (parsedName || parsedAddress)) {
          const nameParts = (parsedName || '').trim().split(' ');
          await supabase.from('customers').update({
            ...(parsedName ? { first_name: nameParts[0], last_name: nameParts.slice(1).join(' ') || '' } : {}),
            ...(parsedAddress ? { address: parsedAddress } : {}),
          }).eq('id', existingCustomer.id);
          customerId = existingCustomer.id;
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
          structured: { ...(structuredOutputs || {}), address: parsedAddress, caller_name: parsedName, job_type: parsedJobType, job_details: parsedJobDetails },
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
