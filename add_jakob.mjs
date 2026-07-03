import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  let { data: users, error: err } = await supabase.from('users').select('*');
  if(err) {
      console.log(err);
      let res = await supabase.auth.admin.listUsers();
      users = res.data.users;
  }
  const jakob = users.find(u => u.email?.toLowerCase().includes('jakob'));
  if (jakob) {
     console.log("Found Jakob's ID:", jakob.id);
     const { data: companies } = await supabase.from('companies').select('id, name').like('name', 'Test Tier%');
     for (const c of companies) {
        await supabase.from('company_memberships').upsert({
           company_id: c.id,
           user_id: jakob.id,
           role: 'owner'
        }, { onConflict: 'company_id, user_id' });
        console.log("Linked", c.name);
     }
  } else {
     console.log("Could not find Jakob's user");
  }
}
run();
