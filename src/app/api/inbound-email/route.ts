export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';


async function parseEmailContentWithAI(sender: string, subject: string, body: string, images: string[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const prompt = `You are parsing an inbound email for a trade contractor. 
It could either be a "receipt" from a supply house, or a "lead" (a new work order or customer inquiry from a website form or direct email).

Extract the details into this exact JSON structure. Return ONLY valid JSON, no markdown.

{
  "type": "receipt" | "lead",
  
  // IF IT IS A RECEIPT, FILL THESE:
  "supplier_name": "string or null",
  "total_amount": number or null,
  "invoice_number": "string or null",
  "job_number_or_po": "string or null",
  "invoice_date": "string or null",
  "line_items": [
    { "description": "string", "quantity": number or null, "unit_price": number or null, "total": number or null }
  ],
  
  // IF IT IS A LEAD/WORK ORDER, FILL THESE:
  "customer_name": "string or null",
  "customer_phone": "string or null",
  "customer_email": "string or null",
  "address": "string or null",
  "issue_description": "string or null",
  "urgency": "high" | "medium" | "low" (default to medium if unsure)
}

Email From: ${sender}
Subject: ${subject}
Body:
${body.slice(0, 20000)}`;

    const contentArray: any[] = [{ type: 'text', text: prompt }];
    for (const imgBase64 of images) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: imgBase64 }
      });
    }

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0,
      max_tokens: 800,
    });

        let raw = res.choices[0]?.message?.content?.trim() || '{}';
    console.log('[INBOUND EMAIL] RAW AI RESPONSE:', raw);
    let cleaned = raw.replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return { error_debug: 'JSON Parse Error: ' + (e as any).message + ' RAW: ' + raw.slice(0, 500) };
    }
  } catch (err) {
    console.error('[INBOUND EMAIL] OpenAI parse error:', err);
    return { error_debug: (err as any).message || String(err) };
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
  else if (s.includes('jh larson') || s.includes('jhlarson')) supplier_name = 'JH Larson';

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

    let body = `${textBody}\n${htmlBody}`.slice(0, 2000);

    // Extract image attachments
    const attachmentsCount = parseInt((formData.get('attachments') as string) || '0', 10);
    console.log(`[INBOUND EMAIL] Attachments count: ${attachmentsCount}`);
    const images: string[] = [];
    for (let i = 1; i <= attachmentsCount; i++) {
      const file = formData.get(`attachment${i}`) as File | null;
      console.log(`[INBOUND EMAIL] Attachment ${i}: name=${file?.name} type=${file?.type} size=${file?.size}`);
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        // Accept images AND PDFs (pass PDFs as image/png fallback won't work, but log them)
        if (file.type.startsWith('image/')) {
          images.push(`data:${file.type};base64,${base64}`);
          console.log(`[INBOUND EMAIL] Added image attachment: ${file.name}`);
        } else if (file.type === 'application/pdf') {
          console.log(`[INBOUND EMAIL] PDF attachment detected (${file.name}) - extracting text with pdf2json`);
          try {
            const PDFParser = require("pdf2json");
            const pdfText = await new Promise((resolve, reject) => {
              const pdfParser = new PDFParser(null, 1);
              pdfParser.on("pdfParser_dataError",  (errData: any) => reject(errData.parserError));
              pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
              pdfParser.parseBuffer(Buffer.from(arrayBuffer));
            });
            body += '\n\n--- PDF ATTACHMENT TEXT (' + file.name + ') ---\n' + pdfText;
          } catch (pdfErr) {
            console.error(`[INBOUND EMAIL] Failed to parse PDF ${file.name}:`, pdfErr);
          }
        } else {
          // Try treating unknown types as image/jpeg and let OpenAI handle it
          images.push(`data:image/jpeg;base64,${base64}`);
          console.log(`[INBOUND EMAIL] Unknown type ${file.type} - passing as image/jpeg to Vision`);
        }
      }
    }

    // Try OpenAI first
    let parsed = await parseEmailContentWithAI(sender, subject, body, images);
    let openaiError = null;
    if (parsed && parsed.error_debug) {
      openaiError = parsed.error_debug;
      parsed = null;
    }
    if (!parsed) {
      console.log('[INBOUND EMAIL] Falling back to naive receipt parser');
      parsed = { ...naiveParse(sender, subject, body), type: 'receipt', error_debug: openaiError, raw_body_debug: body.slice(0, 1000) };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Route to correct company by matching the "to" email address UUID prefix
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
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id;
    }

    if (!companyId) return NextResponse.json({ success: false, error: 'No company found' }, { status: 400 });

    if (parsed.type === 'lead') {
      // 1. Create or find customer
      let customerId = null;
      if (parsed.customer_name || parsed.customer_phone || parsed.customer_email) {
        const [first, ...rest] = (parsed.customer_name || 'Web Lead').split(' ');
        const last = rest.join(' ');
        
        const { data: cust } = await supabase.from('customers').insert([{
          company_id: companyId,
          first_name: first,
          last_name: last,
          phone_number: parsed.customer_phone,
          email: parsed.customer_email,
        }]).select('id').single();
        customerId = cust?.id;
      }

      // 2. Create Job in Dispatch board
      const { data: job } = await supabase.from('jobs').insert([{
        company_id: companyId,
        customer_id: customerId,
        title: parsed.issue_description || subject || 'New Work Order (Email)',
        address: parsed.address,
        status: 'Lead',
        priority: parsed.urgency === 'high' ? 'high' : 'normal',
        estimated_minutes: 90
      }]).select('id').single();

      // 3. Drop notification in AI Inbox
      await supabase.from('messages').insert([{
        company_id: companyId,
        job_id: job?.id,
        customer_id: customerId,
        channel: 'email',
        direction: 'inbound',
        from_value: parsed.customer_email || sender,
        to_value: toEmail,
        body: `📥 New Lead from Website/Email\nName: ${parsed.customer_name || 'N/A'}\nPhone: ${parsed.customer_phone || 'N/A'}\nAddress: ${parsed.address || 'N/A'}\n\nRequest: ${parsed.issue_description || textBody.slice(0, 200)}`,
        meta: { type: 'lead' }
      }]);

      console.log(`[INBOUND EMAIL] Saved lead: ${parsed.customer_name} → job ${job?.id}`);
      return NextResponse.json({ success: true, type: 'lead', jobId: job?.id });
    }

    // --- RECEIPT FLOW ---
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
      }
    }

    const { data: receiptData, error: receiptError } = await supabase.from('receipts').insert([{
      company_id:     companyId,
      supplier_name:  parsed.supplier_name || 'Unknown',
      total_amount:   parsed.total_amount,
      status:         'Action Required',
      line_items:     parsed.line_items?.length ? parsed.line_items : [{ raw_sender: sender, raw_subject: subject }],
      receipt_url:    null,
      job_id:         jobId,
    }]).select('id').single();

    if (receiptError) return NextResponse.json({ success: false, error: receiptError.message }, { status: 500 });

    const messageBody = `🧾 New Material Receipt: $${parsed.total_amount || '0.00'} from ${parsed.supplier_name || 'Unknown'}\nPO/Job Ref: ${parsed.job_number_or_po || 'None'}\nLine Items: ${parsed.line_items?.length || 0} items parsed.`;

    await supabase.from('messages').insert([{
      company_id: companyId,
      job_id: jobId,
      customer_id: customerId,
      channel: 'email',
      direction: 'inbound',
      from_value: sender,
      to_value: toEmail,
      body: messageBody + (parsed.error_debug ? '\nAI Error: ' + parsed.error_debug : ''),
      meta: { type: 'receipt', receipt_id: receiptData?.id, debug: body.slice(0, 1000), error_debug: parsed.error_debug, raw_body_debug: parsed.raw_body_debug }
    }]);

    return NextResponse.json({ success: true, type: 'receipt', parsed, jobId });

  } catch (err) {
    console.error('[INBOUND EMAIL ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to process email' }, { status: 500 });
  }
}
