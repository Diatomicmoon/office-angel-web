const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies[0].id;
  
  const build = {
    company_id: companyId,
    property_address: '1333 Courtland East',
    city: 'Waconia',
    state: 'MN',
    zip_code: '', 
    contractor_name: '',
    permit_date: '2026-05-18',
    estimated_completion_date: '2026-11-18',
    status: 'foundation',
    notes: 'Permit: WA309610 | Desc: Residential'
  };

  const { data: existing } = await supabase
    .from('new_build_permits')
    .select('id')
    .eq('property_address', build.property_address)
    .eq('company_id', build.company_id)
    .limit(1);
    
  if (!existing || existing.length === 0) {
     const { data, error } = await supabase.from('new_build_permits').insert([build]).select();
     if (error) {
         console.error("Insert error:", error);
     } else {
         console.log("Success:", data);
     }
  } else {
     console.log("Already exists.");
  }
}
run();
