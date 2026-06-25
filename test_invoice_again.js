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
      customer_name: "Test User",
      customer_email: "test@example.com",
      customer_phone: "",
      amount: 400,
      status: 'pending',
    })
    .select()
    .single();
  console.log(error);
}
run();
