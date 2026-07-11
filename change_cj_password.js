import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const email = 'cj.hagen@greensideglass.com';
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
      console.error("Error fetching users:", listError);
      return;
  }
  
  const user = usersData.users.find(u => u.email.toLowerCase() === email);
  
  if (user) {
     const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'CJvikesguy!'
     });
     
     if (updateError) {
         console.error("Error updating password:", updateError);
     } else {
         console.log("Success! Password for CJ updated to CJvikesguy!");
     }
  } else {
     console.log("User not found.");
  }
}
run();
