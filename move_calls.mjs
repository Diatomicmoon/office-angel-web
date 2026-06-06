import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function move() {
  const { data: calls } = await supabase.from('call_logs').select('*');
  console.log(`Found ${calls?.length || 0} calls.`);
  
  if (calls && calls.length > 0) {
    // Move calls from the old Beta Isolation company to Hardhat Electric
    const { error } = await supabase.from('call_logs')
      .update({ company_id: 'a293eb4c-6a95-40b8-8324-bc493ec6b227' })
      .eq('company_id', 'cd7a06ec-5292-4d9f-8713-5139f5823dfe');
      
    if (error) console.error("Error moving calls:", error);
    else console.log("Successfully moved calls to Hardhat Electric");
  }
}
move();
