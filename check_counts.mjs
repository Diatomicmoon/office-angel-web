import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('office-angel-web/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { count: receiptCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true });
  const { count: callCount } = await supabase.from('call_logs').select('*', { count: 'exact', head: true });
  const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
  console.log("Receipts:", receiptCount);
  console.log("Call Logs:", callCount);
  console.log("Messages:", msgCount);
}
check();
