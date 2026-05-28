import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('office-angel-web/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data, error } = await supabase.from('companies').select('id, name, quickbooks_realm_id');
  console.log(data);
}
check();
