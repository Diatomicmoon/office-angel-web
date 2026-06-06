import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

// We use the REST API but we will chunk it extremely small (50 rows) 
// and add a delay so we don't timeout the REST API. It will take longer
// but it will work without the direct Postgres password.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function main() {
  const inputFile = '/home/jakob/Downloads/County_Parcels.csv';
  console.log(`Starting slow-drip REST API import...`);

  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  let headers = [];
  let count = 0;
  let successCount = 0;
  let batch = [];
  const BATCH_SIZE = 50; // Very small batch to avoid REST API timeouts

  for await (const line of rl) {
    if (count === 0) {
      headers = line.split(',');
    } else {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const ownerNameIdx = headers.indexOf('OWNER_NM');
      const houseNoIdx = headers.indexOf('HOUSE_NO');
      const streetNmIdx = headers.indexOf('STREET_NM');
      const cityIdx = headers.indexOf('MUNIC_NM');
      const zipIdx = headers.indexOf('ZIP_CD');
      const buildYrIdx = headers.indexOf('BUILD_YR');
      const sqftIdx = headers.indexOf('PARCEL_AREA');
      const priceIdx = headers.indexOf('SALE_PRICE');
      const dateIdx = headers.indexOf('SALE_DATE');
      const latIdx = headers.indexOf('LAT');
      const lonIdx = headers.indexOf('LON');

      if (latIdx > -1 && values.length > latIdx) {
        const lat = parseFloat(values[latIdx]);
        const lon = parseFloat(values[lonIdx]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const owner = values[ownerNameIdx]?.trim().replace(/"/g, '');
          const address = `${values[houseNoIdx]?.trim()} ${values[streetNmIdx]?.trim()}`.replace(/"/g, '');
          const city = values[cityIdx]?.trim().replace(/"/g, '');
          const zip = values[zipIdx]?.trim().replace(/"/g, '');
          const buildYr = parseInt(values[buildYrIdx], 10) || null;
          const sqft = parseInt(values[sqftIdx], 10) || null;
          const price = parseInt(values[priceIdx], 10) || null;
          const saleDate = values[dateIdx]?.trim().replace(/"/g, '') || null;

          if (address && owner) {
            batch.push({
              owner_name: owner,
              address: address,
              city: city,
              zip: zip,
              build_yr: buildYr,
              sqft: sqft,
              last_sale_price: price,
              last_sale_date: saleDate,
              latitude: lat,
              longitude: lon
            });
          }
        }
      }
    }
    
    count++;

    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from('hennepin_parcels').insert(batch);
      if (error) {
        console.error("Batch insert error:", error.message);
      } else {
        successCount += batch.length;
        if (successCount % 1000 === 0) console.log(`Inserted ${successCount} rows so far via REST...`);
      }
      batch = [];
      await new Promise(r => setTimeout(r, 100)); // 100ms delay to prevent 429 Too Many Requests
    }
  }

  if (batch.length > 0) {
    await supabase.from('hennepin_parcels').insert(batch);
  }

  console.log(`Done! Successfully inserted rows.`);
}

main();
