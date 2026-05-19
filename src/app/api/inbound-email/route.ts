export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function parseEmailContentWithAI(sender: string, subject: string, body: string, images: string[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const prompt = `You are parsing an inbound email for an electrical contractor. 
It could either be a "receipt" from a supply house, a "lead" (a new work order or customer inquiry from a website form or direct email), or a "permit" (from a city, state inspector, or AHJ).

CRITICAL CLASSIFICATION RULES:
1. If the email is from a city, municipality, state inspector, ePermits system, or AHJ (or contains words like "permit", "inspection", "building code"), you MUST classify it as "permit". Even if the email includes a fee payment confirmation or invoice for the permit, it is a "permit", NOT a "receipt".
2. If the email contains a photo or attachment that looks like an invoice, a receipt from a store, or a packing slip (from places like Home Depot, JH Larson, CED), you MUST classify it as "receipt". If the image is a receipt, ignore the fact that the email body might be empty.

FOR RECEIPTS / LINE ITEMS: Supply houses often use cryptic abbreviations, SKU codes, or raw manufacturer part numbers (e.g., "QBT GBD-1", "ARF 3300K", "1P CW-1-SP", "1P SYNC-159-1W"). DO NOT just copy the raw cryptic part numbers into the description. Use your deep knowledge of electrical materials to translate and expand these into plain English trade names that an electrician would actually say on the jobsite (e.g., "Ground Bar", "LED Wafer Light 3000K", "Single Pole Switch", "1-Gang Faceplate"). If it's already clear (like "500' 12-2 WIRE NM ROMEX"), keep it.

FOR JOB NUMBER OR PO (Receipts only): Carefully scan the receipt/invoice for a "PO Number", "Job Name", "Ship To", "Project", or handwritten notes indicating which job this material was purchased for. If you find one, extract it into 'job_number_or_po'.

FOR SUPPLIER NAME (Receipts only): Do NOT use the contractor's name (e.g., Schlemmer Electric) as the supplier. Look for the wholesale supply house or store that actually generated the receipt (e.g., "JH Larson", "Viking Electric", "Home Depot", "CED", "Graybar", "Menards", "Lowe's"). If the receipt was forwarded, look at the original sender's email address domain.

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

    // Some clients send images inside the HTML body as base64 instead of as actual attachments
    // Let's do a quick regex to rip out any embedded images if attachments are empty
    let body = `${textBody}\n${htmlBody}`.slice(0, 2000);
    const images: string[] = [];
    
    // Look for base64 embedded images in HTML
    const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/g;
    let match;
    while ((match = imgRegex.exec(htmlBody)) !== null) {
      const type = match[1];
      const b64 = match[2];
      images.push(`data:image/${type};base64,${b64}`);
    }

    // SendGrid passes attachments by key, either as attachmentX or just scanning all files
    for (const [key, value] of Array.from(formData.entries())) {
      // Use duck-typing instead of instanceof Blob because Next.js polyfills can break instanceof
      if (typeof value === 'object' && value !== null && 'arrayBuffer' in value) {
        const file = value as any;
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        const fileType = file.type || 'application/octet-stream';
        const fileName = file.name || '';
        
        // Sometimes SendGrid sends an image but fileType is blank or octet-stream. Let's check extensions too.
        const isImage = fileType.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(fileName);
        
        if (isImage) {
          if (file.size > 20 * 1024 * 1024) continue; // Skip files > 20MB (OpenAI limit)
          // Make sure we only send supported formats (jpeg, png, webp, gif). Fallback to jpeg MIME to be safe if unknown.
          const cleanType = (fileType.includes('png') || fileType.includes('webp') || fileType.includes('gif')) ? fileType : 'image/jpeg';
          images.push(`data:${cleanType};base64,${base64}`); 
        }
        // We explicitly ignore PDFs and other documents for Vision API for now, 
        // to prevent crashing the OpenAI call with invalid image formats.
      }
    }
    
    // Fallback: If SendGrid sends the raw email string, attachments might be hidden in there.
    const rawEmail = (formData.get('email') as string) || '';
    if (images.length === 0 && rawEmail.length > 0) {
       // Only extract base64 if it's explicitly an image content type
       const b64Regex = /Content-Type:\s*image\/(jpeg|png|webp|gif).*?Content-Transfer-Encoding:\s*base64\s+([A-Za-z0-9+\/=\s]{100,})/g;
       let m2;
       while ((m2 = b64Regex.exec(rawEmail)) !== null) {
          const mimeType = m2[1];
          const rawB64 = m2[2].replace(/\s+/g, '');
          images.push(`data:image/${mimeType};base64,${rawB64}`);
       }
    }

    let parsed = await parseEmailContentWithAI(sender, subject, body, images);
    
    // Safety check: if AI failed to parse JSON, try to guess type from text
    if (!parsed || parsed.error_debug) {
      const allText = (subject + " " + body).toLowerCase();
      if (allText.includes("permit") || allText.includes("inspection")) {
         parsed = { type: 'permit', error_debug: parsed?.error_debug, city_ahj: "Unknown City (Fallback)", fee_amount: 0 };
      } else {
         parsed = { type: 'receipt', error_debug: parsed?.error_debug }; // Fallback
      }
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

      // Push into call_logs so it appears on the CRM / Leads page
      await supabase.from('call_logs').insert([{
        company_id: companyId,
        call_status: 'completed',
        urgency_flag: parsed.urgency || 'low',
        summary: parsed.issue_description || subject || 'Email Inquiry',
        action_items: `Respond to email lead from ${sender}`,
        meta: {
          structured: {
            caller_name: parsed.customer_name || sender,
            address: parsed.address || 'Address unknown',
            job_type: 'Email Lead',
            job_details: parsed.issue_description || body.slice(0, 500),
            job_id: job?.id
          }
        }
      }]);

      return NextResponse.json({ success: true, type: 'lead' });
    }

    if (parsed.type === 'permit') {
      await supabase.from('messages').insert([{ company_id: companyId, channel: 'email', direction: 'inbound', from_value: sender, body: `🎫 Permit: ${parsed.city_ahj || 'Unknown City'} - ${parsed.permit_number || 'No #'} - $${parsed.fee_amount || 0}` }]);
      
      // Push to permits table
      await supabase.from('permits').insert([{
        company_id: companyId,
        municipality: parsed.city_ahj || 'Unknown City',
        permit_number: parsed.permit_number || null,
        fee_amount: parsed.fee_amount || 0,
        status: 'Active'
      }]);

      // Also push to receipts table but flagged as a permit for the financial dashboard
      await supabase.from('receipts').insert([{
        company_id: companyId,
        supplier_name: parsed.city_ahj || 'City Permit Office',
        total_amount: parsed.fee_amount || 0,
        status: 'Action Required',
        job_id: null,
        line_items: [{ description: `Permit: ${parsed.permit_number || ''}`, total: parsed.fee_amount || 0 }]
      }]);

      return NextResponse.json({ success: true, type: 'permit' });
    }

    // Receipt
    
    // Try to auto-link the job if a PO or Job Name was found on the receipt
    let matchedJobId = null;
    let autoLinked = false;
    if (parsed.job_number_or_po) {
      // Fuzzy search against active jobs
      const { data: possibleJobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', companyId)
        .ilike('title', `%${parsed.job_number_or_po.substring(0, 10)}%`)
        .limit(1);
      
      if (possibleJobs && possibleJobs.length > 0) {
        matchedJobId = possibleJobs[0].id;
        autoLinked = true;
      }
    }

    await supabase.from('receipts').insert([{
      company_id: companyId,
      job_id: matchedJobId,
      supplier_name: parsed.supplier_name || sender,
      total_amount: parsed.total_amount,
      status: autoLinked ? 'Reviewed' : 'Action Required', // Auto-mark as reviewed if AI confidently linked it
      line_items: parsed.line_items || []
    }]);

    await supabase.from('messages').insert([{ company_id: companyId, channel: 'email', direction: 'inbound', from_value: sender, body: `🧾 Receipt: $${parsed.total_amount || 0} from ${parsed.supplier_name} (Images: ${images.length})` }]);
    return NextResponse.json({ success: true, type: 'receipt' });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
