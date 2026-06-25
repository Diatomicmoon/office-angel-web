const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_columns_for_table', { table_name: 'invoices' });
  if (error) {
     const res = await supabase.from('invoices').select().limit(0);
     console.log(res);
  } else {
     console.log(data);
  }
}
check();
