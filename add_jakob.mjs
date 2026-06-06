import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addJakob() {
  const { error } = await supabase.from('company_memberships').insert({
    user_id: 'edda60d6-f6c4-447e-8377-af28964c54ea', // Jakob
    company_id: 'a293eb4c-6a95-40b8-8324-bc493ec6b227', // Hardhat Electric
    role: 'owner'
  });
  if (error) console.error(error);
  else console.log('Added Jakob to Hardhat Electric');
}

addJakob();
