const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: `
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_email TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_phone TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_name TEXT;
    `
  });
  console.log(data, error);
}
run();
