import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const existingUser = usersData.users.find(u => u.email.toLowerCase() === 'cj.hagen@greensideglass.com');
  console.log("Found user ID:", existingUser?.id);
  
  if (existingUser?.id) {
    const { data: company } = await supabase.from('companies').select('*').ilike('name', 'Greenside Glass Co').single();
    if(company) {
       await supabase.from('company_memberships').upsert({
         user_id: existingUser.id,
         company_id: company.id,
         role: 'owner'
       });
       console.log("Linked CJ to Greenside Glass Co");
       
       // Change password just so we have it for Jakob
       await supabase.auth.admin.updateUserById(existingUser.id, {
          password: 'Password123!'
       });
       console.log("Updated password to Password123!");
    }
  }
}
run();
