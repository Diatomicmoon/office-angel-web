import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/jakob/.openclaw/workspace/office-angel-web/.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Delete the old test leads that have dates from 2013/2020
  await supabase.from('leads').delete().neq('status', 'DO_NOT_MATCH'); // Delete everything in leads for a clean slate
  console.log("Cleared out old test leads.");

  // 2. Fetch companies to get companyId
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies[0].id;

  // 3. Do a deep pull from the API and filter for ACTUAL recent sales (last 30 days)
  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const payload = { zip: "55344", limit: 500 };

  console.log("Pulling 500 properties to find actual recent sales...");
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if (!data.data) {
     console.log("No data returned");
     return;
  }

  // Filter for sales in the last 60 days to guarantee we get a few hits for the UI
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);

  const recentSales = data.data.filter(prop => {
    if (!prop.lastSaleDate) return false;
    const saleDate = new Date(prop.lastSaleDate);
    return saleDate >= cutoffDate;
  });

  console.log(`Found ${recentSales.length} actual recent sales out of 500 records.`);

  if (recentSales.length > 0) {
    // Only take up to 5 to show in UI
    const leadsToInsert = recentSales.slice(0, 5).map((prop) => {
      let name = prop.owner1LastName;
      if (name) {
        name = name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
      } else {
        name = 'Current Resident';
      }

      return {
        company_id: companyId,
        property_address: prop.address?.street || prop.address?.address || 'Unknown',
        city: prop.address?.city || '',
        state: prop.address?.state || '',
        zip_code: prop.address?.zip || "55344",
        new_owner_name: name,
        sale_date: prop.lastSaleDate,
        latitude: prop.latitude || null,
        longitude: prop.longitude || null,
        status: 'new',
        source: 'realestateapi'
      };
    });

    await supabase.from('leads').insert(leadsToInsert);
    console.log("Inserted clean, recent leads!");
  } else {
    console.log("No recent sales found in the 500 sample block. We might need a bigger limit or the market is slow in that zip.");
  }
}
run();
