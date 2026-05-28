import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies[0].id;

  // Eden Prairie, Plymouth, Minnetonka Zips
  const zipsToScrape = [
    '55344', '55347', '55346', // Eden Prairie
    '55441', '55442', '55446', '55447', // Plymouth
    '55305', '55343', '55345' // Minnetonka
  ];

  let totalInserted = 0;
  
  // Looking for homes sold in the last 6 months so we get a really solid list for the UI demo
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180); 

  for (const zip of zipsToScrape) {
    console.log(`Scraping ${zip}...`);
    const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
    
    // We limit to 50 per zip here just to keep the API fast for this manual fill
    const payload = { zip: zip, limit: 100 };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!data || !data.data) continue;

    const recentSales = data.data.filter(prop => {
      if (!prop.lastSaleDate) return false;
      const saleDate = new Date(prop.lastSaleDate);
      return saleDate >= cutoffDate;
    });

    if (recentSales.length > 0) {
      const leadsToInsert = recentSales.map((prop) => {
        let name = prop.owner1LastName || 'Current Resident';
        if (name !== 'Current Resident') name = name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');

        return {
          company_id: companyId,
          property_address: prop.address?.street || 'Unknown',
          city: prop.address?.city || '',
          state: prop.address?.state || '',
          zip_code: zip,
          new_owner_name: name,
          sale_date: prop.lastSaleDate,
          latitude: prop.latitude || null,
          longitude: prop.longitude || null,
          status: 'new',
          source: 'realestateapi'
        };
      });

      const { error } = await supabase.from('leads').insert(leadsToInsert);
      if (!error) totalInserted += leadsToInsert.length;
    }
  }
  console.log(`Successfully filled database with ${totalInserted} recent sales across EP, Plymouth, and Minnetonka!`);
}
run();
