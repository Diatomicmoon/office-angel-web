const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const jakob = users.users.find(u => u.email === 'jakob@hardhat.com' || u.phone === '+16125986260');
  console.log("Jakob user ID:", jakob?.id);
  
  if (jakob) {
    const { data } = await supabase.from('company_memberships').select('*').eq('user_id', jakob.id);
    console.log("Memberships:", data);
  }
}
run();
