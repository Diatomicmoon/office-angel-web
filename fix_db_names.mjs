import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/jakob/.openclaw/workspace/office-angel-web/.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Nuke the old "Current Resident" leads to clean up the UI
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('new_owner_name', 'Current Resident');
    
  if (error) console.error("Error deleting old leads:", error);
  else console.log("Cleaned up old 'Current Resident' leads from the database.");
}
run();
