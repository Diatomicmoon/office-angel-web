const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'office-angel-web/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching current companies table columns...");
  const { data, error } = await supabase.from('companies').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Columns:", Object.keys(data[0] || {}));
  }
}
run();