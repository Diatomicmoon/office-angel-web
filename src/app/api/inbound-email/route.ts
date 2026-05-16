export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function parseEmailContentWithAI(sender: string, subject: string, body: string, images: string[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const prompt = `You are parsing an inbound email for a trade contractor. 
It could either be a "receipt" from a supply house, a "lead" (a new work order or customer inquiry from a website form or direct email), or a "permit" (from a city or inspector).

Extract the details into this exact JSON structure. Return ONLY valid JSON, no markdown.

{
  "type": "receipt" | "lead" | "permit",
  
  "supplier_name": "string or null",
  "total_amount": number or null,
  "invoice_number": "string or null",
  "job_number_or_po": "string or null",
  "invoice_date": "string or null",
  "line_items": [
    { "description": "string", "quantity": number or null, "unit_price": number or null, "total": number or null }
  ],
  
  "customer_name": "string or null",
  "customer_phone": "string or null",
  "customer_email": "string or null",
  "address": "string or null",
  "issue_description": "string or null",
  "urgency": "high" | "medium" | "low",

  "permit_number": "string or null",
  "city_ahj": "string or null",
  "permit_type": "string or null",
  "issue_date": "string or null",
  "expiration_date": "string or null",
  "fee_amount": number or null
}

Email From: ${sender}
Subject: ${subject}
Body:
${body.slice(0, 20000)}`;

    const contentArray: any[] = [{ type: 'text', text: prompt }];
    for (const imgBase64 of images) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: imgBase64, detail: "high" }
      });
    }

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0,
      max_tokens: 1500,
    });

    let raw = res.choices[0]?.message?.content?.trim() || '{}';
    let cleaned = raw.replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      return { error_debug: 'JSON Parse Error: ' + (e as any).message };
    }
  } catch (err) {
    return { error_debug: (err as any).message || String(err) };
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const sender   = (formData.get('from')    as string) || '';
    const subject  = (formData.get('subject') as string) || '';
    const textBody = (formData.get('text')    as string) || '';
    const htmlBody = (formData.get('html')    as string) || '';
    const toEmail  = (formData.get('to')      as string) || '';

    let body = `${textBody}\n${htmlBody}`.slice(0, 2000);
    const images: string[] = [];

    // SendGrid passes attachments by key, either as attachmentX or just scanning all files
    for (const [key, value] of Array.from(formData.entries())) {
      // Use duck-typing instead of instanceof Blob because Next.js polyfills can break instanceof
      if (typeof value === 'object' && value !== null && 'arrayBuffer' in value) {
        const file = value as any;
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        const fileType = file.type || 'application/octet-stream';
        
        if (fileType.startsWith('image/')) {
          if (file.size > 20 * 1024 * 1024) continue; // Skip files > 20MB (OpenAI limit)
          images.push(`data:${fileType};base64,${base64}`);
        } else if (fileType === 'application/pdf') {
            // Can't pass raw PDF bytes directly to OpenAI Vision url, but we can pass as image/jpeg 
            // and see if OpenAI rejects it or somehow handles it. (Ideally we'd use pdf2json here)
            images.push(`data:image/jpeg;base64,${base64}`); 
        } else {
            // Unrecognized blob from Apple Mail etc. Assumed image.
            images.push(`data:image/jpeg;base64,${base64}`);
        }
      }
    }

    let parsed = await parseEmailContentWithAI(sender, subject, body, images);
    if (!parsed || parsed.error_debug) {
      parsed = { type: 'receipt', error_debug: parsed?.error_debug }; // Fallback
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
    if (!companyId && toEmail) {
      const uuidMatch = toEmail.match(/inbox_([a-f0-9-]{36})@/i);
      if (uuidMatch) {
        const { data: co } = await supabase.from('companies').select('id').eq('inbox_token', uuidMatch[1]).single();
        companyId = co?.id;
      }
    }

    if (!companyId) return NextResponse.json({ success: false, error: 'No company found' }, { status: 400 });

    if (parsed.type === 'lead') {
      const { data: job } = await supabase.from('jobs').insert([{
        company_id: companyId, title: parsed.issue_description || subject || 'New Work Order (Email)', status: 'Lead'
      }]).select('id').single();
      
      await supabase.from('messages').insert([{ company_id: companyId, job_id: job?.id, channel: 'email', direction: 'inbound', from_value: sender, body: `📥 New Lead: ${subject}` }]);
      return NextResponse.json({ success: true, type: 'lead' });
    }

    if (parsed.type === 'permit') {
      await supabase.from('messages').insert([{ company_id: companyId, channel: 'email', direction: 'inbound', from_value: sender, body: `🎫 Permit: ${parsed.city_ahj}` }]);
      return NextResponse.json({ success: true, type: 'permit' });
    }

    // Receipt
    await supabase.from('receipts').insert([{
      company_id: companyId, supplier_name: parsed.supplier_name || sender, total_amount: parsed.total_amount, status: 'Action Required'
    }]);

    await supabase.from('messages').insert([{ company_id: companyId, channel: 'email', direction: 'inbound', from_value: sender, body: `🧾 Receipt: $${parsed.total_amount || 0} from ${parsed.supplier_name} (Images: ${images.length})` }]);
    return NextResponse.json({ success: true, type: 'receipt' });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
