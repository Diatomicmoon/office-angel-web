const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function run() {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      company_id: process.env.OFFICE_ANGEL_COMPANY_ID,
      customer_name: "The ups store",
      customer_email: "jakob@hardha",
      customer_phone: "2154805128",
      amount: 400,
      status: 'pending',
    })
    .select()
    .single();
  console.log('Invoice Error:', error);
  if (!error && data) {
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert([{
        invoice_id: data.id,
        description: "Spring clean up",
        quantity: 1,
        rate: 400,
        amount: 400
      }]);
    console.log('Items Error:', itemsError);
  }
}
run();
