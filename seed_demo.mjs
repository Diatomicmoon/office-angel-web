import { createClient } from '@supabase/supabase-js';

// Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node seed_demo.mjs
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ztknhbilfergfwoxjzvb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COMPANY_ID = '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a';

async function seed() {
  console.log('🌱 Seeding demo data...');

  // 1. Demo customers
  const { data: customers, error: cuErr } = await supabase.from('customers').insert([
    { company_id: COMPANY_ID, phone_number: '+16125551001', first_name: 'Mike', last_name: 'Johnson', address: '4821 Oak Street, Eden Prairie, MN' },
    { company_id: COMPANY_ID, phone_number: '+16125551002', first_name: 'Lisa', last_name: 'Anderson', address: '1203 Maple Ave, Minnetonka, MN' },
    { company_id: COMPANY_ID, phone_number: '+16125551003', first_name: 'Dave', last_name: 'Thompson', address: '987 Elm Blvd, Chaska, MN' },
    { company_id: COMPANY_ID, phone_number: '+16125551004', first_name: 'Karen', last_name: 'Williams', address: '563 Cedar Lane, Shakopee, MN' },
    { company_id: COMPANY_ID, phone_number: '+16125551005', first_name: 'Pro Build LLC', last_name: '', address: '2200 Commerce Dr, Chanhassen, MN' },
  ]).select();

  if (cuErr) { console.error('Customer Error:', cuErr); return; }
  console.log('✅ Customers seeded');

  // 2. Demo call logs
  const callLogs = [
    {
      company_id: COMPANY_ID,
      customer_id: customers[0].id,
      call_status: 'completed',
      duration_seconds: 187,
      transcript: [{ speaker: 'AI', text: 'Thanks for calling, this is Sarah. How can I help?' }, { speaker: 'User', text: 'Hi my name is Mike Johnson, I have a sparking outlet in my kitchen at 4821 Oak Street Eden Prairie.' }, { speaker: 'AI', text: 'Okay Mike, that sounds urgent. Is there any smoke or burning smell?' }, { speaker: 'User', text: 'Yes there is a slight burning smell.' }, { speaker: 'AI', text: "I'm going to dispatch a technician to you immediately. Please turn off that breaker now." }],
      summary: 'Mike Johnson at 4821 Oak Street, Eden Prairie called about a sparking kitchen outlet with a burning smell. HIGH urgency — emergency dispatch required immediately.',
      urgency_flag: 'high',
      action_items: 'Dispatch emergency technician immediately',
      meta: { provider: 'vapi', structured: { caller_name: 'Mike Johnson', address: '4821 Oak Street, Eden Prairie, MN', job_type: 'Emergency - Sparking Outlet', job_details: 'Sparking outlet in kitchen with burning smell. Breaker advised to shut off.' } },
      created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
      company_id: COMPANY_ID,
      customer_id: customers[1].id,
      call_status: 'completed',
      duration_seconds: 312,
      transcript: [{ speaker: 'AI', text: 'Thanks for calling, this is Sarah. How can I help?' }, { speaker: 'User', text: 'Hi this is Lisa Anderson at 1203 Maple Ave Minnetonka, I need a quote for a 200 amp panel upgrade.' }, { speaker: 'AI', text: "Great, I can schedule an estimate. Are you available this Thursday?" }, { speaker: 'User', text: 'Thursday at 10am works perfect.' }],
      summary: 'Lisa Anderson at 1203 Maple Ave, Minnetonka requested a quote for a 200A panel upgrade. Estimate scheduled for Thursday at 10am. Medium urgency.',
      urgency_flag: 'medium',
      action_items: 'Schedule estimate / site visit',
      meta: { provider: 'vapi', structured: { caller_name: 'Lisa Anderson', address: '1203 Maple Ave, Minnetonka, MN', job_type: '200A Panel Upgrade', job_details: 'Customer wants full 200A panel upgrade. Thursday 10am estimate booked.' } },
      created_at: new Date(Date.now() - 1000 * 60 * 52).toISOString()
    },
    {
      company_id: COMPANY_ID,
      customer_id: customers[2].id,
      call_status: 'completed',
      duration_seconds: 224,
      transcript: [{ speaker: 'AI', text: 'Thanks for calling, this is Sarah. How can I help?' }, { speaker: 'User', text: 'Dave Thompson here at 987 Elm Blvd Chaska. My kitchen lights keep flickering.' }, { speaker: 'AI', text: 'How long has this been happening Dave?' }, { speaker: 'User', text: 'About two weeks now.' }],
      summary: 'Dave Thompson at 987 Elm Blvd, Chaska reported flickering kitchen lights for the past two weeks. Low urgency, troubleshooting visit needed.',
      urgency_flag: 'low',
      action_items: 'Schedule troubleshooting visit',
      meta: { provider: 'vapi', structured: { caller_name: 'Dave Thompson', address: '987 Elm Blvd, Chaska, MN', job_type: 'Flickering Lights', job_details: 'Kitchen lights flickering for 2 weeks. No burning smell or breaker trips.' } },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      company_id: COMPANY_ID,
      customer_id: customers[3].id,
      call_status: 'completed',
      duration_seconds: 145,
      transcript: [{ speaker: 'AI', text: 'Thanks for calling, this is Sarah. How can I help?' }, { speaker: 'User', text: 'Hi Karen Williams, 563 Cedar Lane Shakopee. I need an EV charger installed in my garage.' }, { speaker: 'AI', text: 'Absolutely, do you have a specific charger in mind or would you like a recommendation?' }, { speaker: 'User', text: 'I need a recommendation.' }],
      summary: 'Karen Williams at 563 Cedar Lane, Shakopee wants an EV charger installed in her garage. Needs charger recommendation. Low urgency, site visit needed.',
      urgency_flag: 'low',
      action_items: 'Schedule estimate / site visit',
      meta: { provider: 'vapi', structured: { caller_name: 'Karen Williams', address: '563 Cedar Lane, Shakopee, MN', job_type: 'EV Charger Installation', job_details: 'Residential EV charger install in garage. Needs charger recommendation from tech.' } },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      company_id: COMPANY_ID,
      customer_id: customers[4].id,
      call_status: 'missed',
      duration_seconds: 0,
      summary: 'Missed call from Pro Build LLC commercial account. Likely calling about the downtown commercial wiring project follow-up.',
      urgency_flag: 'medium',
      action_items: 'Call back Pro Build LLC — commercial account',
      meta: { provider: 'vapi', structured: { caller_name: 'Pro Build LLC', address: '2200 Commerce Dr, Chanhassen, MN', job_type: 'Commercial - Missed Call', job_details: 'Missed call from commercial GC. Needs callback.' } },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
    },
  ];

  const { error: logErr } = await supabase.from('call_logs').insert(callLogs);
  if (logErr) console.error('Call Log Error:', logErr);
  else console.log('✅ Call logs seeded');

  // 3. Update technicians
  const { error: techErr } = await supabase.from('technicians').upsert([
    { company_id: COMPANY_ID, name: 'Marcus', status: 'en_route', current_job_title: 'Emergency - Sparking Outlet', last_location_address: 'Heading to 4821 Oak St, Eden Prairie', updated_at: new Date().toISOString() },
    { company_id: COMPANY_ID, name: 'Steve', status: 'on_job', current_job_title: 'Panel Upgrade', last_location_address: '1203 Maple Ave, Minnetonka', updated_at: new Date().toISOString() },
    { company_id: COMPANY_ID, name: 'Tony', status: 'available', last_location_address: 'Shop - Waconia', updated_at: new Date().toISOString() },
  ], { onConflict: 'company_id,name' });
  if (techErr) console.error('Tech Error:', techErr);
  else console.log('✅ Technicians updated');

  console.log('\n🎉 Demo data ready! Visit office-angel.com/dashboard');
}

seed();
