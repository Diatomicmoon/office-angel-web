import fs from 'fs';
import csv from 'csv-parser';

let taxNameOnly = 0;
let ownerNameCount = 0;

fs.createReadStream('/home/jakob/.openclaw/workspace/carver_parcels.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (data.OWNER_NAME && data.OWNER_NAME.trim()) {
       ownerNameCount++;
    } else if (data.TAX_NAME && data.TAX_NAME.trim()) {
       taxNameOnly++;
    }
  })
  .on('end', () => {
     console.log(`Has OWNER_NAME: ${ownerNameCount}`);
     console.log(`Missing OWNER_NAME but has TAX_NAME: ${taxNameOnly}`);
  });
