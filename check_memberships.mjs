import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
  if (uErr) { console.error('Error fetching users:', uErr.message); return; }

  console.log('--- USERS ---');
  for (const u of users.users) {
     console.log(u.email, u.id);
  }

  const { data: members, error: mErr } = await supabase.from('company_memberships').select('*');
  if (mErr) { console.error('Error fetching memberships:', mErr.message); return; }

  console.log('\n--- MEMBERSHIPS ---');
  console.log(members);
  
  const { data: companies, error: cErr } = await supabase.from('companies').select('id, name');
  console.log('\n--- COMPANIES ---');
  console.log(companies);
}

check();
