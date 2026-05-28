import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('office-angel-web/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data: receipts } = await supabase.from('receipts').select('total_amount, created_at');
  console.log("Receipts count:", receipts?.length);
  const total = receipts?.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
  console.log("Total Receipt Amount:", total);
}
check();
