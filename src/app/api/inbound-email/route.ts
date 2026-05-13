export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function parseReceiptWithAI(sender: string, subject: string, body: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const prompt = `You are parsing a contractor supply house invoice or receipt email.
Extract the following fields from the email below. Return ONLY valid JSON, no markdown.

Email From: ${sender}
Subject: ${subject}
Body:
${body.slice(0, 4000)}

Return this exact JSON structure:
{
  "supplier_name": "string (company that sent the invoice, e.g. CED, Home Depot, Menards, Viking Electric)",
  "total_amount": number or null (total dollar amount as a number, no $ sign),
  "invoice_number": "string or null",
  "job_number_or_po": "string or null (Look for a PO Number, Job Number, Job Name, or Reference)",
  "invoice_date": "string or null (ISO date format if possible)",
  "line_items": [
    { "description": "string", "quantity": number or null, "unit_price": number or null, "total": number or null }
  ],
  "notes": "string or null (anything else relevant)"
}`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 800,
    });

    const raw = res.choices[0]?.message?.content?.trim() || '{}';
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[INBOUND EMAIL] OpenAI parse error:', err);
    return null;
  }
}

// Fallback naive parser if OpenAI fails
function naiveParse(sender: string, subject: string, body: string) {
  const matches = Array.from(body.matchAll(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g));
  const nums = matches.map(m => Number(String(m[1]).replace(/,/g, ''))).filter(n => Number.isFinite(n));
  const total_amount = nums.length ? Math.max(...nums) : null;

  const s = `${sender} ${subject}`.toLowerCase();
  let supplier_name = sender || 'Unknown Supplier';
  if (s.includes('home depot')) supplier_name = 'Home Depot';
  else if (s.includes('menards')) supplier_name = 'Menards';
  else if (s.includes('viking')) supplier_name = 'Viking Electric';
  else if (s.includes('ced')) supplier_name = 'CED';
  else if (s.includes('crescent')) supplier_name = 'Crescent Electric';
  else if (s.includes('fastenal')) supplier_name = 'Fastenal';

  return { supplier_name, total_amount, invoice_number: null, job_number_or_po: null, invoice_date: null, line_items: [], notes: null };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const sender   = (formData.get('from')    as string) || '';
    const subject  = (formData.get('subject') as string) || '';
    const textBody = (formData.get('text')    as string) || '';
    const htmlBody = (formData.get('html')    as string) || '';
    const toEmail  = (formData.get('to')      as string) || '';

    console.log(`[INBOUND EMAIL] From: ${sender} | Subject: ${subject} | To: ${toEmail}`);

    const body = `${textBody}\n${htmlBody}`.slice(0, 5000);

    // Try OpenAI first, fall back to naive
    let parsed = await parseReceiptWithAI(sender, subject, body);
    if (!parsed || !parsed.supplier_name) {
      console.log('[INBOUND EMAIL] Falling back to naive parser');
      parsed = naiveParse(sender, subject, body);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Route to correct company by matching the "to" email address UUID prefix
    // e.g. inbox_<uuid>@receipts.officeangel.ai → company lookup by inbox_token
    let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;

    if (!companyId && toEmail) {
      const uuidMatch = toEmail.match(/inbox_([a-f0-9-]{36})@/i);
      if (uuidMatch) {
        const { data: co } = await supabase
          .from('companies')
          .select('id')
          .eq('inbox_token', uuidMatch[1])
          .single();
        companyId = co?.id;
      }
    }

    if (!companyId) {
      const { data: c0 } = await supabase
        .from('companies')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1);
      companyId = c0?.[0]?.id;
    }

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'No company found' }, { status: 400 });
    }

    // Attempt to match the PO / Job Number to an existing job in the database
    let jobId = null;
    let customerId = null;
    if (parsed.job_number_or_po) {
      const { data: matchedJobs } = await supabase
        .from('jobs')
        .select('id, customer_id')
        .eq('company_id', companyId)
        .ilike('title', `%${parsed.job_number_or_po}%`)
        .limit(1);

      if (matchedJobs && matchedJobs.length > 0) {
        jobId = matchedJobs[0].id;
        customerId = matchedJobs[0].customer_id;
        console.log(`[INBOUND EMAIL] Matched PO/Job ref '${parsed.job_number_or_po}' to job_id: ${jobId}`);
      }
    }

    // 1. Save the actual receipt (linked to job if found)
    const { data: receiptData, error: receiptError } = await supabase.from('receipts').insert([{
      company_id:     companyId,
      supplier_name:  parsed.supplier_name,
      total_amount:   parsed.total_amount,
      status:         'Action Required',
      line_items:     parsed.line_items?.length ? parsed.line_items : [{ raw_sender: sender, raw_subject: subject }],
      receipt_url:    null,
      job_id:         jobId,
    }]).select('id').single();

    if (receiptError) {
      console.error('[INBOUND EMAIL] Supabase insert error for receipt:', receiptError);
      return NextResponse.json({ success: false, error: receiptError.message }, { status: 500 });
    }

    // 2. Drop a message into the AI Inbox so the dispatcher sees it immediately
    const messageBody = `🧾 New Material Receipt: $${parsed.total_amount || '0.00'} from ${parsed.supplier_name}\nPO/Job Ref: ${parsed.job_number_or_po || 'None'}\nLine Items: ${parsed.line_items?.length || 0} items parsed.`;

    const { error: msgError } = await supabase.from('messages').insert([{
      company_id: companyId,
      job_id: jobId,
      customer_id: customerId,
      channel: 'email',
      direction: 'inbound',
      from_value: sender,
      to_value: toEmail,
      body: messageBody,
      meta: { type: 'receipt', receipt_id: receiptData?.id }
    }]);

    if (msgError) {
      console.error('[INBOUND EMAIL] Failed to drop notification in AI Inbox:', msgError);
      // We don't fail the whole request if just the inbox notification fails
    }

    console.log(`[INBOUND EMAIL] Saved receipt: ${parsed.supplier_name} $${parsed.total_amount} → company ${companyId}`);
    return NextResponse.json({ success: true, parsed, jobId });

  } catch (err) {
    console.error('[INBOUND EMAIL ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to process email' }, { status: 500 });
  }
}
