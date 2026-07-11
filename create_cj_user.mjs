import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: company } = await supabase.from('companies').select('*').ilike('name', 'Greenside Glass Co').single();
  if (!company) {
     console.log('Company Greenside Glass Co not found');
     return;
  }
  
  const email = 'Cj.hagen@greensideglass.com';
  const tempPassword = 'Greenside2026!';

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: "CJ",
      last_name: "Hagen"
    }
  });

  let userId = authData?.user?.id;

  if (authError) {
    if (authError.message.includes('already exists')) {
       console.log('User already exists, finding ID...');
       const { data: usersData } = await supabase.auth.admin.listUsers();
       const existingUser = usersData.users.find(u => u.email === email);
       userId = existingUser?.id;
    } else {
       console.log('Auth Error:', authError.message);
       return;
    }
  }

  if (userId) {
    // Insert into company_memberships
    const { error: dbErr } = await supabase.from('company_memberships').upsert({
      user_id: userId,
      company_id: company.id,
      role: 'owner'
    }, { onConflict: 'company_id, user_id' });
    
    if (dbErr) console.log('DB Error:', dbErr.message);
    else console.log(`Success! Created user for ${email} with company ${company.id}`);
  }
}
run();
