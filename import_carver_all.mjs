import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const results = [];

fs.createReadStream('/home/jakob/.openclaw/workspace/carver_parcels.csv')
  .pipe(csv())
  .on('data', (data) => {
    const addressParts = [data.ANUMBERPRE, data.ANUMBER, data.ANUMBERSUF, data.ST_PRE_MOD, data.ST_PRE_DIR, data.ST_PRE_TYP, data.ST_PRE_SEP, data.ST_NAME, data.ST_POS_TYP, data.ST_POS_DIR, data.ST_POS_MOD].filter(p => p && p.trim() !== '');
    const address = addressParts.join(' ').trim();
    
    let yearBuilt = parseInt(data.YEAR_BUILT, 10);
    if (isNaN(yearBuilt)) yearBuilt = null;
    
    let sqft = parseInt(data.FIN_SQ_FT, 10);
    if (isNaN(sqft)) sqft = null;
    
    let saleValue = parseInt(data.SALE_VALUE, 10);
    if (isNaN(saleValue)) saleValue = null;

    if (address && address.length > 3) {
        results.push({
          owner_name: data.OWNER_NAME ? data.OWNER_NAME.trim() : null,
          address: address,
          city: data.CTU_NAME ? data.CTU_NAME.trim() : null,
          zip: data.ZIP ? data.ZIP.trim() : null,
          build_yr: yearBuilt,
          sqft: sqft,
          last_sale_price: saleValue,
          last_sale_date: data.SALE_DATE ? data.SALE_DATE.trim() : null
        });
    }
  })
  .on('end', async () => {
    console.log(`Ready to insert ${results.length} total Carver parcels into the parcel DB.`);
    
    // Batch insert
    const batchSize = 1000;
    let successCount = 0;
    
    for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        // We're putting it in hennepin_parcels for now, as it functions as a global parcel table
        const { error } = await supabase.from('hennepin_parcels').insert(batch);
        
        if (error) {
           console.log(`DB Insert Error at batch ${i}:`, error.message);
        } else {
           successCount += batch.length;
           console.log(`Inserted ${successCount} / ${results.length}`);
        }
    }
    
    console.log(`Done! Successfully inserted ${successCount} properties.`);
  });
