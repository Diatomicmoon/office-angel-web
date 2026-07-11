const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.new_build_permits ADD COLUMN IF NOT EXISTS homeowner_name TEXT;
      ALTER TABLE public.new_build_permits ADD COLUMN IF NOT EXISTS homeowner_phone TEXT;
    `
  });
  console.log("RPC Error:", error);
}
run();
