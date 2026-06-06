import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
dotenv.config({ path: './.env' });
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Applying Database Feature Flags for Hard Hat Solutions...");
  
  const sql = fs.readFileSync('../scripts/bouncie/add_feature_flags.sql', 'utf8');

  // Since Supabase JS client doesn't have a direct raw SQL execution method that works on all environments without an RPC,
  // we will just write the RPC function or check if the columns exist first.
  
  // Quick test to see if the table responds
  const { data, error } = await supabase.from('companies').select('id').limit(1);
  if (error) {
     console.log("Error checking companies:", error.message);
  } else {
     console.log("DB Connection good. To apply the SQL, please run this block in the Supabase SQL Editor manually:");
     console.log("\n----------------------------------\n");
     console.log(sql);
     console.log("\n----------------------------------\n");
  }
}

run();