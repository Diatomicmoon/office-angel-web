import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCompany() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: node create-company.mjs <company_name> <phone_number_optional>");
    process.exit(1);
  }

  const name = args[0];
  const phone = args[1] || null;

  console.log(`Creating company: ${name}...`);

  const { data: company, error } = await supabase
    .from('companies')
    .insert([{
      name,
      phone_number: phone,
      ai_enabled: true
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error.message);
    process.exit(1);
  }

  console.log("Company created successfully!");
  console.log("Company ID:", company.id);
  console.log("Now run: node add-membership.mjs <user_id> <company_id>");
}

createCompany();
