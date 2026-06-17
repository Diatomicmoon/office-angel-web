import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const params = new URLSearchParams(textBody);
    
    const dialCallStatus = params.get('DialCallStatus');
    const toPhone = params.get('To'); // This is our Twilio number that the customer called
    const fromPhone = params.get('From'); // The customer's phone number

    // If the human didn't answer the forwarded call
    if (dialCallStatus === 'no-answer' || dialCallStatus === 'busy' || dialCallStatus === 'canceled') {
      console.log(`[TWILIO VOICE STATUS] Missed call detected for ${toPhone}. Sending auto text back to ${fromPhone}.`);

      const { data: company, error } = await supabase()
        .from('companies')
        .select('id, name')
        .eq('phone_number', toPhone)
        .single();

      if (company && !error) {
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const messageBody = `Hey, this is ${company.name || 'our team'}. We are on a job site right now and missed your call—how can we help you today?`;
        
        await twilioClient.messages.create({
          body: messageBody,
          from: toPhone || process.env.TWILIO_PHONE_NUMBER,
          to: fromPhone!
        });

        // Log to ledger
        await supabase().from('company_ledger').insert({
          company_id: company.id,
          category: 'expense',
          transaction_type: 'twilio_sms',
          amount: 0.02, // approx Twilio SMS cost
          status: 'incurred'
        });

        // Optional: Save to messages table so it shows up in their inbox
        await supabase().from('messages').insert({
          company_id: company.id,
          from_phone: toPhone,
          to_phone: fromPhone,
          body: messageBody,
          direction: 'outbound',
          status: 'delivered'
        });
      }
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;
    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('[TWILIO VOICE STATUS] Error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
