import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const data = JSON.parse(fs.readFileSync('./hennepin_new_builds.json', 'utf8'));
  console.log("Importing " + data.length + " new builds into Supabase...");

  let successCount = 0;
  
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies?.[0]?.id;
  
  if (!companyId) {
    console.error("No company found to attach leads to!");
    return;
  }

  for (const build of data) {
    const { owner, address, build_yr, lat, lon } = build;
    
    if (!lat || !lon || address.includes('   ,')) continue;

    // Based on the DB schema check:
    const cityStr = address.split(',')[1]?.trim().split(' ')[0] || '';
    const zipStr = address.split('MN')[1]?.trim() || '';

    const { error } = await supabase.from('leads').insert({
      company_id: companyId,
      property_address: address.split(',')[0],
      city: cityStr,
      state: 'MN',
      zip_code: zipStr,
      new_owner_name: owner,
      status: 'new',
      source: 'County CSV Import',
      notes: "Year Built: " + build_yr,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon)
    });

    if (error) {
      console.error("Error inserting:", error.message);
    } else {
      successCount++;
    }
  }

  console.log("Successfully imported " + successCount + " new builds into Canvassing Map!");
}

main();
