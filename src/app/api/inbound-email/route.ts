import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function parseTotal(text: string) {
  // naive but effective: grab the largest $X.XX looking value
  const matches = Array.from(text.matchAll(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g));
  if (matches.length === 0) return null;
  const nums = matches
    .map(m => Number(String(m[1]).replace(/,/g, '')))
    .filter(n => Number.isFinite(n));
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function guessSupplier(from: string, subject: string) {
  const s = `${from} ${subject}`.toLowerCase();
  if (s.includes('home depot')) return 'Home Depot';
  if (s.includes('menards')) return 'Menards';
  if (s.includes('viking')) return 'Viking Electric';
  if (s.includes('ced')) return 'CED';
  return from || 'Unknown Supplier';
}

export async function POST(req: Request) {
  try {
    // 1. Receive the webhook payload (from SendGrid, Postmark, or Mailgun)
    const formData = await req.formData();
    
    const sender = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const textBody = formData.get('text') as string;
    const htmlBody = formData.get('html') as string;
    
    // In production, we will extract PDF attachments here:
    // const attachments = formData.getAll('attachments');

    console.log(`[INBOUND EMAIL] Received from: ${sender}`);
    console.log(`[INBOUND EMAIL] Subject: ${subject}`);

    // 2. Minimal receipt extraction (no LLM yet)
    const body = `${textBody || ''}\n${htmlBody || ''}`;
    const supplier_name = guessSupplier(sender || '', subject || '');
    const total_amount = parseTotal(body);

    // 3. Insert into Supabase receipts table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id;
    }

    if (companyId) {
      const { error } = await supabase.from('receipts').insert([
        {
          company_id: companyId,
          supplier_name,
          total_amount,
          status: 'Action Required',
          line_items: [{ raw_sender: sender, raw_subject: subject }],
        },
      ]);

      if (error) console.error('[INBOUND EMAIL] Supabase insert error:', error);
    }

    return NextResponse.json({ success: true, message: "Email received and queued for AI processing." });
  } catch (error) {
    console.error("[INBOUND EMAIL ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to process inbound email webhook" }, { status: 500 });
  }
}
