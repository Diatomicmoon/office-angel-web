const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
      .from('invoice_items')
      .insert({
        invoice_id: 'fe3cdab2-5cf0-4328-bb4d-fb7d199c3169',
        description: 'Test',
        quantity: 1,
        rate: 100,
        amount: 100,
      })
      .select()
      .single();
  console.log('Data:', data);
  console.log('Error:', error);
}
check();
