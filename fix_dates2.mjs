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

  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  // Pulling 2000 to find actual recent sales in the zip code
  const payload = { zip: "55344", limit: 2000 };

  console.log("Pulling 2000 properties to find actual recent sales...");
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  // Try 90 days if market is slow
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const recentSales = data.data.filter(prop => {
    if (!prop.lastSaleDate) return false;
    const saleDate = new Date(prop.lastSaleDate);
    return saleDate >= cutoffDate;
  });

  console.log(`Found ${recentSales.length} actual recent sales!`);

  if (recentSales.length > 0) {
    const leadsToInsert = recentSales.slice(0, 5).map((prop) => {
      let name = prop.owner1LastName || 'Current Resident';
      if (name !== 'Current Resident') name = name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');

      return {
        company_id: companyId,
        property_address: prop.address?.street || 'Unknown',
        city: prop.address?.city || '',
        state: prop.address?.state || '',
        zip_code: "55344",
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
  }
}
run();
