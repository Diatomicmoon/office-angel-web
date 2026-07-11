const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  await supabase.from('timesheets').update({ clock_out: new Date().toISOString() }).is('clock_out', null);
  console.log("Cleaned up stuck timesheets");
}
run();
