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

function deriveJobTitle(args: {
  jobType?: string | null;
  jobDetails?: string | null;
  summary?: string | null;
  urgencyFlag?: string | null;
}) {
  const jobType = (args.jobType || '').trim();
  const jobDetails = (args.jobDetails || '').trim();
  const summary = (args.summary || '').trim();

  const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/[\s,.;:]+$/g, '').trim();

  if (jobType && jobType.toLowerCase() !== 'electrical') return clean(jobType).slice(0, 80);
  if (jobDetails) return clean(jobDetails).slice(0, 80);
  if (summary) return clean(summary.split(/[\n.]/)[0]).slice(0, 80);
  if (args.urgencyFlag === 'high') return 'Emergency Service Call';
  return 'Service Call';
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
      // Normalize structured outputs — Vapi sends them keyed by UUID {id: {name, result}}
      // Convert to simple {field_name: value} map
      const rawStructured = structuredFromArtifact || null;
      const structuredOutputs: Record<string, any> = {};
      if (rawStructured) {
        Object.values(rawStructured).forEach((item: any) => {
          if (item?.name && item?.result !== undefined) {
            structuredOutputs[item.name] = item.result;
          } else if (typeof item === 'string' || typeof item === 'number') {
            // already flat
          }
        });
        // Also copy any already-flat keys
        Object.entries(rawStructured).forEach(([k, v]: any) => {
          if (typeof v !== 'object' || v === null) structuredOutputs[k] = v;
        });
      }
      console.log('📊 Normalized structured outputs:', JSON.stringify(structuredOutputs));

      // Parse address + caller name from transcript text as ultimate fallback
      const transcriptText = Array.isArray(transcript)
        ? transcript.map((t: any) => `${t.speaker || t.role}: ${t.text || t.message || ''}`).join('\n')
        : String(transcript || '');
      
      // Simple extraction from transcript if structured outputs missing
      const addressMatch = transcriptText.match(/(?:address is|at)\s+([\d][^.\n]+(?:Street|St|Drive|Dr|Ave|Avenue|Blvd|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)[^.\n]*)/i);
      const parsedAddress = structuredOutputs?.address || (addressMatch ? addressMatch[1].trim() : null);

      // Name extraction: structured output → transcript regex (case-insensitive)
      const nameMatch = transcriptText.match(
        /(?:my name is|i(?:'?m| am)|this is|name'?s?\s+is|speaking with|calling as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
      );
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
      let resolvedName: string | null = parsedName || null;
      if (phoneNumber !== 'Unknown') {
        // Name priority: 1) caller said it (parsedName) → 2) saved from Twilio Lookup on inbound → 3) fresh Lookup

        if (!resolvedName) {
          // Check the 'incoming' call log we created when the call started
          const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
          const { data: incomingLog } = await supabase
            .from('call_logs')
            .select('id, meta')
            .eq('company_id', companyId)
            .eq('call_status', 'incoming')
            .gte('created_at', cutoff)
            .order('created_at', { ascending: false })
            .limit(1);

          const savedLookup = incomingLog?.[0]?.meta?.lookup_name as string | null;
          if (savedLookup) {
            resolvedName = savedLookup;
            console.log('📋 Name from incoming lookup record:', resolvedName);
            // Mark the incoming record as processed so it clears from co-pilot
            await supabase.from('call_logs').update({ call_status: 'processed' }).eq('id', incomingLog![0].id);
          }
        }

        // Last resort: fresh Twilio Lookup
        if (!resolvedName) {
          try {
            const lookupRes = await fetch(
              `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phoneNumber)}?Fields=caller_name`,
              { headers: { 'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64') } }
            );
            const lookupData = await lookupRes.json();
            const raw = lookupData?.caller_name?.caller_name as string | null;
            if (raw) {
              resolvedName = raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
              console.log('📋 Fresh Twilio Lookup name:', resolvedName);
            }
          } catch (e) {
            console.log('Twilio Lookup failed (non-fatal):', e);
          }
        }

        console.log('👤 Final resolved name:', resolvedName || '(none — will save as New Caller)');

        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id, first_name')
          .eq('company_id', companyId)
          .eq('phone_number', phoneNumber)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
          const isUnnamed = !existingCustomer.first_name || existingCustomer.first_name === 'New';
          if ((resolvedName && isUnnamed) || parsedAddress) {
            const nameParts = (resolvedName || '').trim().split(' ');
            await supabase.from('customers').update({
              ...(resolvedName && isUnnamed ? { first_name: nameParts[0], last_name: nameParts.slice(1).join(' ') || '' } : {}),
              ...(parsedAddress ? { address: parsedAddress } : {}),
            }).eq('id', existingCustomer.id);
          }
        } else {
          const nameParts = (resolvedName || '').trim().split(' ');
          const firstName = nameParts[0] || 'New';
          const lastName = nameParts.slice(1).join(' ') || 'Caller';

          const { data: newCustomer, error: cErr } = await supabase
            .from('customers')
            .insert([{
              company_id: companyId,
              phone_number: phoneNumber,
              first_name: firstName,
              last_name: lastName,
              address: parsedAddress || null,
            }])
            .select()
            .single();

          if (!cErr && newCustomer) customerId = newCustomer.id;
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
          structured: { ...(structuredOutputs || {}), address: parsedAddress, caller_name: resolvedName, job_type: parsedJobType, job_details: parsedJobDetails },
        },
      };

      let callLogId: string | null = null;
      let logErr: any = null;
      {
        const res = await supabase
          .from('call_logs')
          .insert([baseRow])
          .select('id')
          .single();
        logErr = res.error;
        callLogId = res.data?.id || null;
      }

      // If the DB migration hasn't been applied yet, retry without the new optional columns.
      if (logErr && (String(logErr.message || '').includes('recording_url') || String(logErr.message || '').includes('meta'))) {
        const fallbackRow = { ...baseRow };
        delete fallbackRow.recording_url;
        delete fallbackRow.meta;

        const res2 = await supabase
          .from('call_logs')
          .insert([fallbackRow])
          .select('id')
          .single();
        logErr = res2.error;
        callLogId = res2.data?.id || callLogId;
      }

      if (logErr) {
        console.error("Error saving call to DB:", logErr);
      } else {
        console.log("✅ Call saved to Supabase successfully!");
      }

      // 4. Create a Job for EVERY call (unassigned → shows up in Dispatch "AI Parking Lot")
      try {
        const title = deriveJobTitle({ jobType: parsedJobType, jobDetails: parsedJobDetails, summary: finalSummary, urgencyFlag });
        const priority = urgencyFlag === 'high' ? 'high' : urgencyFlag === 'low' ? 'low' : 'normal';

        // Some Supabase projects may not have the dispatch columns migrated yet.
        // Try insert with priority; if the column doesn't exist, retry without it.
        let job: any = null;
        let jobErr: any = null;

        {
          const res = await supabase
            .from('jobs')
            .insert([
              {
                company_id: companyId,
                customer_id: customerId,
                title,
                status: 'Lead',
                address: parsedAddress || null,
                priority,
              },
            ])
            .select('id')
            .single();

          job = res.data;
          jobErr = res.error;
        }

        if (jobErr && String(jobErr.message || '').includes('priority')) {
          const res2 = await supabase
            .from('jobs')
            .insert([
              {
                company_id: companyId,
                customer_id: customerId,
                title,
                status: 'Lead',
                address: parsedAddress || null,
              },
            ])
            .select('id')
            .single();
          job = res2.data;
          jobErr = res2.error;
        }

        if (jobErr) {
          console.error('Error creating job:', jobErr);
        } else {
          console.log('🧾 Job created:', job?.id);
          // Best-effort: link the job back to the call log via meta. (Safe to fail.)
          if (callLogId) {
            await supabase
              .from('call_logs')
              .update({
                meta: {
                  ...(baseRow.meta || {}),
                  structured: {
                    ...((baseRow.meta || {}).structured || {}),
                    job_id: job?.id,
                  },
                },
              })
              .eq('id', callLogId);
          }
        }
      } catch (e) {
        console.error('Job creation/linking failed (non-fatal):', e);
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
