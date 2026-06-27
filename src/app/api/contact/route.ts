import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { name, phone, message, smsConsent } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    let jobData = null;
    let companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;

    if (supabaseUrl && supabaseKey && companyId) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Insert into jobs (as a Lead)
      const { data: job } = await supabase.from('jobs').insert([{
        company_id: companyId,
        title: `Web Lead: ${name} (${phone})`,
        status: 'Lead',
        description: message
      }]).select('id').single();
      
      jobData = job;

      // 2. Insert into call_logs so it shows in the CRM
      await supabase.from('call_logs').insert([{
        company_id: companyId,
        call_status: 'completed',
        urgency_flag: 'medium',
        summary: `Website Contact Form Submission from ${name}`,
        action_items: `Call/Text back ${name} at ${phone}`,
        meta: {
          structured: {
            caller_name: name,
            phone: phone,
            job_type: 'Web Lead',
            job_details: message,
            sms_consent: smsConsent,
            job_id: job?.id
          }
        }
      }]);
    } else {
      console.warn("Supabase keys or company ID missing, skipping DB insert.");
    }
    
    // 3. Send email to sales@hardhat-solutions.com using SendGrid (if key exists)
    if (process.env.SENDGRID_API_KEY) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'sales@hardhat-solutions.com' }] }],
          from: { email: 'sales@hardhat-solutions.com', name: 'Hard Hat Website' },
          subject: `New Web Lead: ${name}`,
          content: [{
            type: 'text/html',
            value: `
              <h2>New Website Lead</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Message:</strong><br/>${message}</p>
              <p><strong>SMS Consent:</strong> ${smsConsent ? 'Yes' : 'No'}</p>
            `
          }]
        })
      });
    } else {
      console.warn("No SendGrid API Key found, skipping email notification");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
