import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// This endpoint receives the parsed email payload from Make.com 
// (which bypassed the 4.5MB Vercel limit by uploading the image to Supabase first)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from: sender, subject, text, html, to: toEmail, imageUrl } = body;
    
    const emailText = `${text || ''}\n${html || ''}`.slice(0, 2000);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `You are parsing an inbound email for an electrical contractor. 
It could either be a "receipt" from a supply house, a "lead" (a new work order or customer inquiry from a website form or direct email), or a "permit" (from a city, state inspector, or AHJ).

CRITICAL CLASSIFICATION RULES:
1. If the email is from a city, municipality, state inspector, ePermits system, or AHJ (or contains words like "permit", "inspection", "building code"), you MUST classify it as "permit". Even if the email includes a fee payment confirmation or invoice for the permit, it is a "permit", NOT a "receipt".
2. If the email contains a photo or attachment that looks like an invoice, a receipt from a store, or a packing slip (from places like Home Depot, JH Larson, CED, Viking Electric), you MUST classify it as "receipt". If the image is a receipt, ignore the fact that the email body might be empty.
3. If the email is a customer asking for work, an online form submission, or a new work order, classify it as "lead". DO NOT classify emails from supply houses (JH Larson, CED, etc.) as leads.

FOR JOB NUMBER OR PO (Receipts only): Carefully scan the receipt/invoice for a "PO Number", "Job Name", "Ship To", "Project", or handwritten notes indicating which job this material was purchased for. If you find one, extract it into 'job_number_or_po'. CRITICAL: Do NOT extract the supplier/store name (like "JH Larson", "CED", "Home Depot", "Viking Electric") as the Job/PO Name! The job name is usually an address, a person's name, or a specific project name, not the wholesale house you bought it from.

FOR SUPPLIER NAME (Receipts only): Do NOT use the contractor's name (e.g., Schlemmer Electric) as the supplier. Look for the wholesale supply house or store that actually generated the receipt (e.g., "JH Larson", "Viking Electric", "Home Depot", "CED", "Graybar", "Menards", "Lowe's"). Ensure "JH Larson" and similar companies are ALWAYS placed here in 'supplier_name', never in 'job_number_or_po'. If the receipt was forwarded, look at the original sender's email address domain.

FOR LINE ITEMS (Receipts only): You must translate supplier part numbers into clean, common 'Trade Names' or everyday electrician slang. Do not just spit back the raw barcode/catalog numbers. The extracted description MUST be immediately readable by a field worker (e.g., "20A GFCI Receptacle White" instead of "GFTR20-W", or "1/2 in. EMT Conduit" instead of "050EMT"). Save this translated name to the 'description' field.

CRITICAL PARSING RULES FOR WHOLESALE RECEIPTS (like JH Larson, CED, Viking):
1. **Multi-line Rows**: Wholesale receipts often split a single item across multiple lines. The part number (e.g., 'LTN AYCL-153P-WH', 'HND RA-1588') is usually on the first line, and the text description is directly below it in the SAME 'Description' column. Do NOT treat the part number and the description as two separate items. Combine them into one line item and translate it to a trade name.
2. **Pricing Units (/ea, /c, /m)**: Pay extreme attention to the unit pricing column. 
   - '/ea' means price per each. 
   - '/c' means price per 100 (e.g., $28.52 /c = $0.2852 per each). 
   - '/m' means price per 1000 (e.g., $60.00 /m = $0.06 per each). 
   Always calculate and output the true 'unit_price' for a single item (1 unit) in standard dollars (e.g. 0.28, 0.06, 25.00), not the bulk unit price.
3. **Quantity**: Look at 'SHIP QTY' or 'ORDER QTY' to get the exact integer quantity.

Extract the details into this exact JSON structure. Return ONLY valid JSON, no markdown.

{
  "type": "receipt" | "lead" | "permit",
  
  "supplier_name": "string or null",
  "total_amount": number or null,
  "invoice_number": "string or null",
  "job_number_or_po": "string or null",
  "invoice_date": "string or null",
  "line_items": [
    { "description": "string (MUST be the Trade Name / Slang, not the raw part #)", "original_part_number": "string or null", "quantity": number or null, "unit_price": number or null, "total": number or null }
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

Email From: ${sender || 'Unknown'}
Subject: ${subject || 'No Subject'}
Body:
${emailText}`;

    const contentArray: any[] = [{ type: 'text', text: prompt }];
    
    // Add the Supabase URL instead of a base64 string
    if (imageUrl) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: "high" }
      });
    }

    const res = await openai.chat.completions.create({
      model:  'gpt-4o-mini',
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0,
      max_tokens: 1500,
    });

    let raw = res.choices[0]?.message?.content?.trim() || '{}';
    let cleaned = raw.replace(/^\`\`\`json\s*/i, '').replace(/^\`\`\`\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'JSON Parse Error' }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder');
    
    
    let companyId = null;

    // 1. Try matching by Inbox Token (if we ever use SendGrid inbound parse)
    if (toEmail) {
      const uuidMatch = toEmail.match(/inbox_([a-f0-9-]{36})@/i);
      if (uuidMatch) {
        const { data: co } = await supabase.from('companies').select('id').eq('inbox_token', uuidMatch[1]).single();
        if (co) companyId = co.id;
      }
    }

    // 2. Try matching by Sender Email (if the user forwarded the receipt from their own email)
    if (!companyId && sender) {
      const emailMatch = sender.match(/<([^>]+)>/);
      const cleanEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : sender.toLowerCase().trim();
      
      const { data: user } = await supabase.from('users').select('company_id').eq('email', cleanEmail).single();
      if (user && user.company_id) {
        companyId = user.company_id;
      }
    }

    // 3. Fallback to Hard Hat Demo Company
    if (!companyId) {
      companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
    }


    if (!companyId) return NextResponse.json({ success: false, error: 'No company found' }, { status: 400 });

    if (parsed.type === 'receipt') {
      let matchedJobId = null;
      let autoLinked = false;
      if (parsed.job_number_or_po) {
        const searchStr = parsed.job_number_or_po.substring(0, 15).trim();
        const { data: possibleJobs } = await supabase
          .from('jobs')
          .select('id, title')
          .eq('company_id', companyId)
          .or(`title.ilike.%${searchStr}%,address.ilike.%${searchStr}%`)
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
        status: autoLinked ? 'Reviewed' : 'Action Required',
        line_items: parsed.line_items || []
      }]);

      // Auto-build internal material cost database from receipt line items
      if (parsed.line_items && Array.isArray(parsed.line_items)) {
        for (const item of parsed.line_items) {
          if (!item.description || !item.unit_price) continue;
          const name = item.description.trim().toLowerCase();
          const price = parseFloat(item.unit_price);
          if (isNaN(price) || price <= 0) continue;

          // Upsert: if item+supplier combo exists, update running stats
          const { data: existing } = await supabase
            .from('material_costs')
            .select('*')
            .eq('company_id', companyId)
            .ilike('item_name', name)
            .eq('supplier', parsed.supplier_name || 'Unknown')
            .single();

          if (existing) {
            const newCount = (existing.price_count || 1) + 1;
            const newAvg = ((existing.avg_price * existing.price_count) + price) / newCount;
            await supabase.from('material_costs').update({
              last_price: price,
              avg_price: Math.round(newAvg * 100) / 100,
              min_price: Math.min(existing.min_price || price, price),
              max_price: Math.max(existing.max_price || price, price),
              price_count: newCount,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }).eq('id', existing.id);
          } else {
            await supabase.from('material_costs').insert([{
              company_id: companyId,
              item_name: item.description.trim(),
              unit: item.unit || 'each',
              last_price: price,
              avg_price: price,
              min_price: price,
              max_price: price,
              price_count: 1,
              supplier: parsed.supplier_name || 'Unknown',
              category: item.category || null,
              source: 'receipt',
              last_seen: new Date().toISOString()
            }]);
          }
        }
      }

      await supabase.from('messages').insert([{ company_id: companyId, channel: 'email', direction: 'inbound', from_value: sender || 'Unknown', body: `🧾 Receipt: $${parsed.total_amount || 0} from ${parsed.supplier_name} (via Make.com webhook)` }]);
    }

    return NextResponse.json({ success: true, type: parsed.type, parsed });

  } catch (err) {
    console.error('Make webhook receiver error:', err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 200 });
  }
}
