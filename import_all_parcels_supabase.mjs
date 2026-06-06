import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTableIfNotExists() {
  // Try to insert a dummy record to see if the table exists, and handle it gracefully
  const { error } = await supabase.from('hennepin_parcels').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.error("Table does not exist. Please run the SQL migration manually in the Supabase Dashboard SQL editor:");
    const sql = fs.readFileSync('supabase/migrations/20260530163000_create_hennepin_parcels.sql', 'utf8');
    console.log("-----");
    console.log(sql);
    console.log("-----");
    process.exit(1);
  }
}

async function main() {
  await createTableIfNotExists();

  const inputFile = '/home/jakob/Downloads/County_Parcels.csv';
  console.log(`Starting bulk import of 448k properties into Supabase from ${inputFile}...`);

  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  let headers = [];
  let count = 0;
  let successCount = 0;
  let batch = [];
  const BATCH_SIZE = 2000;

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
        console.log(`Inserted ${successCount} rows so far...`);
      }
      batch = [];
      
      // Artificial delay to not completely hammer the free tier connection pool
      await new Promise(r => setTimeout(r, 200)); 
    }
  }

  // Insert any remaining in the final batch
  if (batch.length > 0) {
    const { error } = await supabase.from('hennepin_parcels').insert(batch);
    if (!error) {
      successCount += batch.length;
    }
  }

  console.log(`Done! Successfully inserted ${successCount} properties into Supabase.`);
}

main();
