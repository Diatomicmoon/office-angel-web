import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function seed() {
  // 1. Create a dummy company
  const { data: company, error: cErr } = await supabase.from('companies').insert([
    { name: 'Hardhat Electric', phone_number: '+16125550199' }
  ]).select().single();
  
  if (cErr) console.log("Company Error:", cErr);

  // 2. Create some customers
  const { data: customers, error: cuErr } = await supabase.from('customers').insert([
    { company_id: company.id, phone_number: '+16125551111', first_name: 'John', last_name: 'Martinez', address: '1442 Grand Ave' },
    { company_id: company.id, phone_number: '+16125552222', first_name: 'Sarah', last_name: 'Jenkins', address: '1042 Elm St' },
    { company_id: company.id, phone_number: '+16125553333', first_name: 'Tech Solutions LLC', last_name: '', address: '900 Downtown Blvd' }
  ]).select();

  if (cuErr) console.log("Customer Error:", cuErr);

  // 3. Insert Call logs
  const callLogs = [
    {
      company_id: company.id,
      customer_id: customers[0].id,
      call_status: 'completed',
      duration_seconds: 180,
      summary: 'Customer called reporting a sparking outlet in the kitchen. Walked them through shutting off the breaker.',
      urgency_flag: 'high',
      action_items: 'Dispatch emergency tech immediately',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 mins ago
    },
    {
      company_id: company.id,
      customer_id: customers[1].id,
      call_status: 'completed',
      duration_seconds: 320,
      summary: 'Inquiry for a 200A panel upgrade. Quoted rough estimate. Site survey booked for Thursday at 10 AM.',
      urgency_flag: 'medium',
      action_items: 'Send formal estimate for $4,200',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
    },
    {
      company_id: company.id,
      customer_id: customers[2].id,
      call_status: 'missed',
      duration_seconds: 45,
      summary: 'Automated follow-up on overdue invoice of $4,500. Left voicemail.',
      urgency_flag: 'low',
      action_items: 'Invoice Overdue - Send polite follow up email',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    }
  ];

  const { error: logErr } = await supabase.from('call_logs').insert(callLogs);
  if (logErr) console.log("Call Log Error:", logErr);

  // 4. Insert Technicians (optional; safe-fail if table not created yet)
  try {
    const { error: techErr } = await supabase.from('technicians').insert([
      {
        company_id: company.id,
        name: 'Marcus',
        status: 'en_route',
        current_job_title: 'Kitchen outlet emergency',
        last_location_address: 'Heading to 1442 Grand Ave',
        updated_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      },
      {
        company_id: company.id,
        name: 'Tasha',
        status: 'available',
        last_location_address: 'Shop',
        updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ]);
    if (techErr) console.log('Technicians Error:', techErr);
  } catch (e) {
    // ignore
  }

  console.log("Database seeded!");
}
seed();
