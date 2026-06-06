import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const recordsToUpdate = [];

fs.createReadStream('/home/jakob/.openclaw/workspace/carver_parcels.csv')
  .pipe(csv())
  .on('data', (data) => {
    const addressParts = [data.ANUMBERPRE, data.ANUMBER, data.ANUMBERSUF, data.ST_PRE_MOD, data.ST_PRE_DIR, data.ST_PRE_TYP, data.ST_PRE_SEP, data.ST_NAME, data.ST_POS_TYP, data.ST_POS_DIR, data.ST_POS_MOD].filter(p => p && p.trim() !== '');
    const address = addressParts.join(' ').trim();
    const taxName = data.TAX_NAME ? data.TAX_NAME.trim() : null;
    
    if (address && address.length > 3 && taxName) {
        recordsToUpdate.push({
           address: address,
           owner_name: taxName,
           city: data.CTU_NAME ? data.CTU_NAME.trim() : null
        });
    }
  })
  .on('end', async () => {
     console.log(`Ready to update ${recordsToUpdate.length} names.`);
     
     // Rather than updating row by row, since we just inserted them today and they have no latitude/longitude 
     // or specific IDs we care about (they are just cached data), we can either update them or just delete the 
     // carver ones and re-insert. Wait, updating by address is slow if there's no index, but we can try.
     
     // Actually, it's safer to just run an update query matching address and city.
     let successCount = 0;
     const batchSize = 1000;
     
     for (let i = 0; i < recordsToUpdate.length; i += batchSize) {
         const batch = recordsToUpdate.slice(i, i + batchSize);
         
         // Supabase doesn't support batch update by different where clauses easily. 
         // We can do it via a postgres function, or delete/re-insert.
         
         // Since we know Carver county cities:
         break; // let's do a better way
     }
  });
