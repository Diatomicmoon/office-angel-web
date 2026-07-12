import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { company_id, customer_name, customer_email, customer_phone, items, isDraft, job_id } = await req.json();

    if (!company_id || !customer_name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.qty * item.rate;
    }

    const estimatePayload: any = {
      company_id,
      customer_name,
      customer_email,
      customer_phone,
      amount: totalAmount,
      status: 'pending',
    };

    if (job_id) {
      estimatePayload.job_id = job_id;
    }

    // Insert estimate
    const { data: estimateData, error: estimateError } = await supabase
      .from('estimates')
      .insert(estimatePayload)
      .select()
      .single();

    if (estimateError) {
      console.error('Error inserting estimate:', estimateError);
      return NextResponse.json({ error: `Failed to create estimate: ${estimateError.message || JSON.stringify(estimateError)}` }, { status: 500 });
    }

    const estimateId = estimateData.id;

    // Insert estimate items
    const itemsToInsert = items.map((item: any) => ({
      estimate_id: estimateId,
      description: item.desc,
      quantity: item.qty,
      rate: item.rate,
      amount: item.qty * item.rate,
    }));

    const { error: itemsError } = await supabase
      .from('estimate_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting estimate items:', itemsError);
      return NextResponse.json({ error: `Failed to create estimate items: ${itemsError.message || JSON.stringify(itemsError)}` }, { status: 500 });
    }

    // Build the Magic Link
    const requestUrl = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin || 'https://hardhat-solutions.com';
    const magicLink = `${origin}/portal/estimate/${estimateId}`;

    // Send SMS via Twilio if configured and phone is provided and it's NOT a draft
    if (!isDraft && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && customer_phone) {
      try {
        const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilioClient.messages.create({
          body: `Hi ${customer_name}, here is your project estimate from Hard Hat Solutions for $${totalAmount.toFixed(2)}. You can review and approve it securely here: ${magicLink}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: customer_phone.startsWith('+1') ? customer_phone : `+1${customer_phone}`
        });
        console.log(`Sent SMS estimate to ${customer_phone}`);
      } catch (smsError) {
        console.error('Failed to send SMS via Twilio:', smsError);
      }
    }

    return NextResponse.json({ estimate: estimateData, magic_link: magicLink });
  } catch (error: any) {
    console.error('Estimate creation failed:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
