import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("Checking Permits Table...");
  const { data: permits } = await supabase.from('permits').select('*').order('created_at', { ascending: false }).limit(2);
  console.log(permits);
  
  console.log("Checking Receipts (Financials) Table...");
  const { data: receipts } = await supabase.from('receipts').select('*').eq('status', 'Action Required').order('created_at', { ascending: false }).limit(2);
  console.log(receipts);
}
check();
