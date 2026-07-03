import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createClientUser() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: node create-user.mjs <email> <password> <name> <phone_number>");
    process.exit(1);
  }

  const [email, password, name, phone_number] = args;

  console.log(`Creating user: ${email}...`);

  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  }

  console.log("User created successfully:", user.user.id);
  console.log("Adding to profiles...");
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: user.user.id,
      name,
      phone: phone_number,
      role: 'owner'
    }]);
    
  if (profileError) {
      console.log("Profile insert error:", profileError);
  } else {
      console.log("Profile created!");
  }

  console.log("\n--- NEXT STEPS ---");
  console.log("1. Run get-companies.mjs to find the company_id, or create a new company.");
  console.log("2. Insert a row into 'company_memberships' linking user_id to company_id.");
}

createClientUser();
