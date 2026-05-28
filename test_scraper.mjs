import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Running Manual Lead Scraper test...');

  try {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    const companyId = companies[0].id;
    const targetZips = ['55344']; // Just one zip for the test to save credits
    let totalInserted = 0;

    for (const zip of targetZips) {
      console.log(`Scraping zip: ${zip}`);
      const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
      const payload = { zip: zip, limit: 100 };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REAL_ESTATE_API_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // Let's force-insert 3 records just so you can see them in your software right now
      console.log(`Pulling 3 properties to inject into Office Angel...`);
      const sampleSales = data.data.slice(0, 3);

      const leadsToInsert = sampleSales.map((prop) => ({
        company_id: companyId,
        property_address: prop.address?.street || prop.address?.address || 'Unknown',
        city: prop.address?.city || '',
        state: prop.address?.state || '',
        zip_code: prop.address?.zip || zip,
        // Grabbing owner name or falling back if API hides it on this endpoint
        new_owner_name: prop.ownerName || (prop.owner && prop.owner.name) || prop.owner1FullName || 'Current Resident',
        sale_date: prop.lastSaleDate || prop.lastSale?.date || new Date().toISOString().split('T')[0],
        sale_price: prop.lastSalePrice || prop.lastSale?.price || 0,
        status: 'new',
        source: 'realestateapi'
      }));

      const { error: insertError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (insertError) {
        console.error('Database Error:', insertError);
      } else {
        totalInserted += leadsToInsert.length;
      }
    }

    console.log(`\n✅ BOOM. ${totalInserted} real properties successfully injected into the Office Angel database!`);
  } catch (err) {
    console.error(err);
  }
}

run();
