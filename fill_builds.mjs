import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies[0].id;

  const today = new Date();
  
  const mockBuilds = [
    {
      company_id: companyId,
      property_address: '1023 Lakeview Ter',
      city: 'Waconia',
      zip_code: '55387',
      contractor_name: 'Lennar',
      permit_date: new Date(today.getTime() - 1000 * 3600 * 24 * 10).toISOString().split('T')[0], // 10 days ago
      estimated_completion_date: new Date(today.getTime() + 1000 * 3600 * 24 * 170).toISOString().split('T')[0], // ~6 months future
      status: 'foundation'
    },
    {
      company_id: companyId,
      property_address: '405 Timber Creek Dr',
      city: 'Waconia',
      zip_code: '55387',
      contractor_name: 'M/I Homes',
      permit_date: new Date(today.getTime() - 1000 * 3600 * 24 * 85).toISOString().split('T')[0], // ~3 months ago
      estimated_completion_date: new Date(today.getTime() + 1000 * 3600 * 24 * 95).toISOString().split('T')[0], // ~3 months future
      status: 'foundation'
    },
    {
      company_id: companyId,
      property_address: '16072 Baywood La',
      city: 'Eden Prairie',
      zip_code: '55346',
      contractor_name: 'AFFORDABLE EGRESS WINDOWS',
      permit_date: new Date(today.getTime() - 1000 * 3600 * 24 * 165).toISOString().split('T')[0], // ~5.5 months ago
      estimated_completion_date: new Date(today.getTime() + 1000 * 3600 * 24 * 15).toISOString().split('T')[0], // ~2 weeks future (MOVE IN WINDOW)
      status: 'foundation'
    }
  ];

  const { error } = await supabase.from('new_build_permits').insert(mockBuilds);
  if (error) console.error("Error inserting:", error);
  else console.log("Successfully injected mock new builds!");
}

run();
