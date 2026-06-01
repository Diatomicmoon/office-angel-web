import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function geocodeOnce(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'OfficeAngel/1.0' } });
  const json: any = await res.json().catch(() => null);
  if (!json || json.length === 0) return null;
  const loc = json[0];
  const lat = Number(loc.lat);
  const lng = Number(loc.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function geocode(address: string, apiKey: string) {
  const a = String(address || '').trim();
  if (!a) return null;
  const r1 = await geocodeOnce(a);
  if (r1) return r1;
  const hasState = /\b(MN|Minnesota)\b/i.test(a);
  if (!hasState) return await geocodeOnce(`${a}, MN`);
  return null;
}


function cleanCallerName(input: unknown): string | null {
  if (!input) return null;
  let s = String(input).trim();
  if (!s) return null;

  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^(hi|hey|hello)[, ]+/i, '');
  s = s.replace(/^(this is|my name is|name'?s?\s+is|i(?:'?m| am))\s+/i, '');
  s = s.replace(/[.,:;!]+$/g, '');

  // If it looks like an intro ("Sarah with Office Angel"), keep only the person name.
  s = s.replace(/\s+(with|from|at)\b.*$/i, '');

  const bad = new Set(['unknown', 'caller', 'new', 'office', 'angel']);
  const tokens = s.split(' ').filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    const low = t.toLowerCase();
    if (['with', 'from', 'at'].includes(low)) break;
    if (bad.has(low)) return null;
    out.push(t);
    if (out.length >= 3) break;
  }

  if (out.length === 0) return null;
  return out
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

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

function heuristicDurationMinutes(text: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(burning|smoke|sparking|arcing|fire|no power|power out|outage)/)) return 120;
  if (s.match(/(panel upgrade|service upgrade|200a|100a|service change)/)) return 480;
  if (s.match(/(ev charger|tesla|charger)/)) return 240;
  if (s.match(/(recessed|can light|lighting install|fixtures)/)) return 180;
  if (s.match(/(breaker tripping|tripping)/)) return 120;
  if (s.match(/(outlet|switch|gfci)/)) return 60;
  if (s.match(/(estimate|quote)/)) return 90;
  return 90;
}

function roundUpToNextSlot(d: Date, slotMinutes = 30) {
  const ms = d.getTime();
  const slotMs = slotMinutes * 60 * 1000;
  return new Date(Math.ceil(ms / slotMs) * slotMs);
}

const DISPLAY_TZ = 'America/Chicago';

function tzParts(d: Date, timeZone: string): { y: number; mo: number; day: number; h: number; mi: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), mo: get('month'), day: get('day'), h: get('hour'), mi: get('minute') };
}

function zonedTimeToUtcMs({ y, mo, day, h, mi, timeZone }: { y: number; mo: number; day: number; h: number; mi: number; timeZone: string }) {
  let guess = Date.UTC(y, mo - 1, day, h, mi, 0);
  for (let i = 0; i < 4; i++) {
    const p = tzParts(new Date(guess), timeZone);
    const desired = Date.UTC(y, mo - 1, day, h, mi, 0);
    const got = Date.UTC(p.y, p.mo - 1, p.day, p.h, p.mi, 0);
    const delta = desired - got;
    if (Math.abs(delta) < 60000) break;
    guess += delta;
  }
  return guess;
}

function clampToBusinessHours(d: Date, scheduleStartMin: number, scheduleEndMin: number) {
  const p = tzParts(d, DISPLAY_TZ);
  const localMin = p.h * 60 + p.mi;

  const setLocal = (y: number, mo: number, day: number, minuteOfDay: number) => {
    const h = Math.floor(minuteOfDay / 60);
    const mi = minuteOfDay % 60;
    const utc = zonedTimeToUtcMs({ y, mo, day, h, mi, timeZone: DISPLAY_TZ });
    return new Date(utc);
  };

  if (localMin < scheduleStartMin) return setLocal(p.y, p.mo, p.day, scheduleStartMin);
  if (localMin >= scheduleEndMin) {
    const tomorrow = tzParts(new Date(d.getTime() + 24 * 60 * 60 * 1000), DISPLAY_TZ);
    return setLocal(tomorrow.y, tomorrow.mo, tomorrow.day, scheduleStartMin);
  }
  return d;
}

function suggestStartTime({ urgencyFlag, scheduleStartMin, scheduleEndMin }: { urgencyFlag: string | null; scheduleStartMin: number; scheduleEndMin: number }) {
  // Simple + safe: buffer by urgency, then snap to next 30-min boundary.
  const bufferMin = urgencyFlag === 'high' ? 0 : urgencyFlag === 'medium' ? 60 : 180;
  let dt = new Date(Date.now() + bufferMin * 60000);
  dt = clampToBusinessHours(dt, scheduleStartMin, scheduleEndMin);
  dt = roundUpToNextSlot(dt, 30);
  dt = clampToBusinessHours(dt, scheduleStartMin, scheduleEndMin);
  return dt;
}

async function aiEstimateDurationMinutes(args: {
  openaiApiKey?: string | null;
  summary?: string | null;
  jobType?: string | null;
  jobDetails?: string | null;
  urgencyFlag?: string | null;
}) {
  const text = `${args.jobType || ''}\n${args.jobDetails || ''}\n${args.summary || ''}`.trim();
  const fallback = heuristicDurationMinutes(text);

  if (!args.openaiApiKey) return { minutes: fallback, source: 'heuristic' as const };

  try {
    const openai = new OpenAI({ apiKey: args.openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert electrical dispatcher. Estimate job duration in minutes for scheduling. Return STRICT JSON only.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            job_type: args.jobType,
            job_details: args.jobDetails,
            summary: args.summary,
            urgency: args.urgencyFlag,
            instructions: 'Return: {"estimated_minutes": number, "min_minutes": number, "max_minutes": number, "confidence": "low"|"medium"|"high" }'
          })
        }
      ],
      max_tokens: 120,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const json = JSON.parse(raw);
    const minutes = Math.max(15, Math.min(12 * 60, Number(json.estimated_minutes || fallback)));
    return { minutes, source: 'ai' as const };
  } catch (e) {
    console.log('AI duration estimate failed (falling back):', e);
    return { minutes: fallback, source: 'heuristic' as const };
  }
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

      // Parse address + caller name from transcript text as ultimate fallback.
      // IMPORTANT: only use the USER side for name extraction so we don't accidentally capture the AI's name.
      const transcriptTextAll = Array.isArray(transcript)
        ? transcript.map((t: any) => `${t.speaker || t.role}: ${t.text || t.message || ''}`).join('\n')
        : String(transcript || '');

      const transcriptTextUser = Array.isArray(transcript)
        ? transcript
            .filter((t: any) => String(t.speaker || t.role || '').toLowerCase() === 'user')
            .map((t: any) => String(t.text || t.message || '')).join('\n')
        : transcriptTextAll;

      // Simple extraction from transcript if structured outputs missing
      const addressMatch = transcriptTextAll.match(/(?:address is|at)\s+([\d][^.\n]+(?:Street|St|Drive|Dr|Ave|Avenue|Blvd|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)[^.\n]*)/i);
      const parsedAddress = structuredOutputs?.address || (addressMatch ? addressMatch[1].trim() : null);

      // Name extraction:
      // Prefer USER transcript (most reliable) → fall back to structured output only if it doesn't look like an agent intro.
      const rawStructuredName = typeof structuredOutputs?.caller_name === 'string' ? String(structuredOutputs.caller_name).trim() : '';
      const structuredName = rawStructuredName
        // If the structured value contains "with/from/at" it often came from the agent intro ("Sarah with Office Angel").
        && !rawStructuredName.match(/\b(with|from|at)\b/i)
        ? (cleanCallerName(rawStructuredName) || '')
        : '';

      const nameMatch = transcriptTextUser.match(
        /(?:my name is|this is|name'?s?\s+is|i(?:'?m| am))\s+([^\n.]{1,60})/i
      );
      const userName = cleanCallerName(nameMatch ? nameMatch[1] : null);
      const parsedName = userName || structuredName || null;

      const parsedJobType = structuredOutputs?.job_type || null;
      const parsedJobDetails = structuredOutputs?.job_details || null;
      console.log('📍 Parsed address:', parsedAddress, '| 👤 Name:', parsedName);

      // GEOCODE!
      let tagsToUpdate: string[] | undefined = undefined;
      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (parsedAddress && GOOGLE_MAPS_API_KEY) {
        const coords = await geocode(parsedAddress, GOOGLE_MAPS_API_KEY);
        if (coords) {
          tagsToUpdate = [`lat:${coords.lat}`, `lng:${coords.lng}`];
          console.log('🌍 Geocoded Address to:', coords);
        }
      }

      
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
            resolvedName = cleanCallerName(savedLookup) || savedLookup;
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
              resolvedName = cleanCallerName(resolvedName) || resolvedName;
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
          
          if ((resolvedName && isUnnamed) || parsedAddress || tagsToUpdate) {
            const nameParts = (resolvedName || '').trim().split(' ');
            const { data: currentCust } = await supabase.from('customers').select('tags').eq('id', existingCustomer.id).single();
            const oldTags = Array.isArray(currentCust?.tags) ? currentCust.tags : [];
            const mergedTags = tagsToUpdate ? Array.from(new Set([...oldTags.filter(t => !t.startsWith('lat:') && !t.startsWith('lng:')), ...tagsToUpdate])) : undefined;
            
            await supabase.from('customers').update({
              ...(resolvedName && isUnnamed ? { first_name: nameParts[0], last_name: nameParts.slice(1).join(' ') || '' } : {}),
              ...(parsedAddress ? { address: parsedAddress } : {}),
              ...(mergedTags ? { tags: mergedTags } : {})
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
              ...(tagsToUpdate ? { tags: tagsToUpdate } : {})

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
          structured: {
            ...(structuredOutputs || {}),
            address: parsedAddress,
            // Prefer the name the caller said (parsedName); fall back to lookup name only when missing.
            caller_name: parsedName || resolvedName,
            caller_name_source: parsedName ? 'caller' : (resolvedName ? 'lookup' : null),
            lookup_name: resolvedName || null,
            job_type: parsedJobType,
            job_details: parsedJobDetails,
          },
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

        const durationRes = await aiEstimateDurationMinutes({
          openaiApiKey: process.env.OPENAI_API_KEY || null,
          summary: finalSummary || null,
          jobType: parsedJobType || null,
          jobDetails: parsedJobDetails || null,
          urgencyFlag: urgencyFlag || null,
        });
        const estimatedMinutes = durationRes.minutes;

        // Suggested schedule (pre-fills Dispatch so dispatcher can 1-click book).
        const { data: companySettings } = await supabase
          .from('companies')
          .select('schedule_start_minute, schedule_end_minute')
          .eq('id', companyId)
          .maybeSingle();

        const scheduleStartMin = typeof (companySettings as any)?.schedule_start_minute === 'number'
          ? Number((companySettings as any).schedule_start_minute)
          : 480;
        const scheduleEndMin = typeof (companySettings as any)?.schedule_end_minute === 'number'
          ? Number((companySettings as any).schedule_end_minute)
          : 1020;

        const suggestedStart = suggestStartTime({ urgencyFlag, scheduleStartMin, scheduleEndMin });
        const suggestedEnd = new Date(suggestedStart.getTime() + estimatedMinutes * 60000);

        // Check if the Vapi tool 'book_appointment' was already called mid-call
        const toolCalls = payload.message?.artifact?.toolCalls || payload.message?.toolCalls || [];
        const wasJobBookedByTool = toolCalls.some((tc: any) => tc?.function?.name === 'book_appointment');

        if (wasJobBookedByTool) {
          console.log('[CALL FINISHED] Job was already booked by Vapi tool mid-call. Skipping duplicate job creation.');
          // Still link the call log to the most recently created job for this company
          const { data: latestJob } = await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latestJob && callLogId) {
            await supabase.from('call_logs').update({
              meta: {
                ...(baseRow.meta || {}),
                structured: {
                  ...((baseRow.meta || {}).structured || {}),
                  job_id: latestJob.id,
                },
              },
            }).eq('id', callLogId);
          }
        } else {
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
                estimated_minutes: estimatedMinutes,
                scheduled_start: suggestedStart.toISOString(),
                scheduled_end: suggestedEnd.toISOString(),
              },
            ])
            .select('id')
            .single();

          job = res.data;
          jobErr = res.error;
        }

        if (jobErr && (String(jobErr.message || '').includes('priority') || String(jobErr.message || '').includes('estimated_minutes') || String(jobErr.message || '').includes('scheduled_start') || String(jobErr.message || '').includes('scheduled_end'))) {
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
        } // End of !wasJobBookedByTool block
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
