import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMembership() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node add-membership.mjs <user_id> <company_id>");
    process.exit(1);
  }

  const [user_id, company_id] = args;

  console.log(`Linking user ${user_id} to company ${company_id}...`);

  const { data, error } = await supabase
    .from('company_memberships')
    .insert([{
      user_id,
      company_id,
      role: 'owner'
    }]);

  if (error) {
    console.error("Error creating membership:", error.message);
    process.exit(1);
  }

  console.log("Membership added successfully!");
}

addMembership();
