const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
      .from('invoices')
      .insert({
        company_id: process.env.OFFICE_ANGEL_COMPANY_ID,
        customer_name: "Test",
        customer_email: "test@test.com",
        amount: 100,
        status: 'pending',
      })
      .select()
      .single();
  console.log('Data:', data);
  console.log('Error:', error);
}
check();
