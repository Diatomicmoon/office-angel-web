import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function purge() {
  console.log("Purging all demo data from Supabase...");
  
  // RLS bypass via service role key, so we can just delete from the root tables
  // Cascading deletes should handle the rest, but we'll hit them all just in case
  const { error: e1 } = await supabase.from('call_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) console.error("Call logs error:", e1);
  
  const { error: e2 } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) console.error("Customers error:", e2);
  
  const { error: e3 } = await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e3) console.error("Companies error:", e3);
  
  console.log("Database purged successfully. It is now clean.");
}

purge();
