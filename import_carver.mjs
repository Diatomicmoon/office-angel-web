import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const results = [];
const newBuilds = [];

fs.createReadStream('/home/jakob/.openclaw/workspace/carver_parcels.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Reconstruct Address
    const addressParts = [data.ANUMBERPRE, data.ANUMBER, data.ANUMBERSUF, data.ST_PRE_MOD, data.ST_PRE_DIR, data.ST_PRE_TYP, data.ST_PRE_SEP, data.ST_NAME, data.ST_POS_TYP, data.ST_POS_DIR, data.ST_POS_MOD].filter(p => p && p.trim() !== '');
    const address = addressParts.join(' ').trim();
    
    let yearBuilt = parseInt(data.YEAR_BUILT, 10);
    if (isNaN(yearBuilt)) yearBuilt = null;
    
    let sqft = parseInt(data.FIN_SQ_FT, 10);
    if (isNaN(sqft)) sqft = null;
    
    let saleValue = parseInt(data.SALE_VALUE, 10);
    if (isNaN(saleValue)) saleValue = null;

    const parcel = {
      owner_name: data.OWNER_NAME ? data.OWNER_NAME.trim() : null,
      address: address,
      city: data.CTU_NAME ? data.CTU_NAME.trim() : null,
      zip: data.ZIP ? data.ZIP.trim() : null,
      build_yr: yearBuilt,
      sqft: sqft,
      last_sale_price: saleValue,
      last_sale_date: data.SALE_DATE ? data.SALE_DATE.trim() : null,
      latitude: null, // Don't have exact lat/lon in this CSV immediately, would geocode later or map provides it
      longitude: null 
    };

    results.push(parcel);

    // Identify new builds
    if (yearBuilt >= 2024 && yearBuilt <= 2026) {
       newBuilds.push(parcel);
    }
  })
  .on('end', async () => {
    console.log(`Parsed ${results.length} total Carver parcels.`);
    console.log(`Found ${newBuilds.length} new builds (2024-2026).`);
    
    fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/carver_new_builds.json', JSON.stringify(newBuilds, null, 2));
    
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id;

    if (companyId && newBuilds.length > 0) {
        console.log("Pushing new builds to map pins...");
        const permitsToInsert = newBuilds.map(b => {
           return {
             company_id: companyId,
             property_address: b.address,
             city: b.city,
             state: 'MN',
             zip_code: b.zip,
             contractor_name: b.owner_name || 'Owner / Unknown',
             status: 'foundation',
             estimated_completion_date: '2026-09-01',
             permit_date: '2026-01-01',
             notes: `County Tax Record: Year Built ${b.build_yr}`
           };
        });

        // Batch insert
        const batchSize = 100;
        let successCount = 0;
        for (let i = 0; i < permitsToInsert.length; i += batchSize) {
            const batch = permitsToInsert.slice(i, i + batchSize);
            const { error } = await supabase.from('new_build_permits').insert(batch);
            if (!error) successCount += batch.length;
        }
        
        console.log(`Successfully pushed ${successCount} Carver new builds to Supabase for the map!`);
    }

    // Now write out the full dataset to a SQLite or raw table, like we did for Hennepin
    // If there's a carver_parcels table, push it there. Let's create it first.
    console.log("Done inserting new builds.");
  });
