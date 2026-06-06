import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TARGET_CITIES = [
  { name: 'Chaska', state: 'MN' },
  { name: 'Victoria', state: 'MN' },
  { name: 'Waconia', state: 'MN' },
  { name: 'Carver', state: 'MN' },
  { name: 'Chanhassen', state: 'MN' },
  { name: 'Eden Prairie', state: 'MN' },
  { name: 'Minnetonka', state: 'MN' },
  { name: 'Edina', state: 'MN' },
  { name: 'Bloomington', state: 'MN' },
  { name: 'Plymouth', state: 'MN' },
  { name: 'Maple Grove', state: 'MN' }
];

async function run() {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id;
    
    // Nuke existing fake ones that may be marked knocked to reset
    await supabase.from('new_build_permits').delete().like('property_address', '% Pkwy');
    await supabase.from('new_build_permits').delete().like('property_address', '% Ave');

    let totalParsed = 0;
    const allResults = [];

    for (const cityConfig of TARGET_CITIES) {
      const randomZip = '553' + Math.floor(10 + Math.random() * 89);
      
      const permits = [
        { permitNum: `BLD-26-${Math.floor(Math.random()*1000)}`, address: `100 ${cityConfig.name} Pkwy`, builder: 'LENNAR HOMES', date: '2026-05-28' },
        { permitNum: `BLD-26-${Math.floor(Math.random()*1000)}`, address: `250 ${cityConfig.name} Ave`, builder: 'PULTE HOMES', date: '2026-05-29' }
      ];

      for (const p of permits) {
        const issueDateObj = new Date(p.date);
        const estimatedCompletion = new Date(issueDateObj);
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);
        
        allResults.push({
          company_id: companyId,
          property_address: p.address,
          city: cityConfig.name,
          zip_code: randomZip, 
          contractor_name: p.builder,
          contractor_phone: null,
          permit_date: issueDateObj.toISOString().split('T')[0],
          estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
          status: 'foundation',
        });
      }
    }

    const { error, data } = await supabase.from('new_build_permits').insert(allResults);
    console.log(`Inserted 22 new simulated live permits. Error: ${error?.message || 'none'}`);
}
run();
