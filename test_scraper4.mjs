import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: companies } = await supabase.from('companies').select('id, name').limit(1);
  const companyId = companies[0].id;
  const zip = '55344';

  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify({ zip: zip, limit: 3 })
  });

  const data = await response.json();
  const sampleSales = data.data.slice(0, 3);

  const leadsToInsert = sampleSales.map((prop) => {
    let name = prop.owner1LastName;
    if (name) {
      // Clean up common corporate/LLC suffixes just for display if we want, but raw is fine
      name = name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
    } else {
      name = 'Current Resident';
    }

    return {
      company_id: companyId,
      property_address: prop.address?.street || prop.address?.address || 'Unknown',
      city: prop.address?.city || '',
      state: prop.address?.state || '',
      zip_code: prop.address?.zip || zip,
      new_owner_name: name,
      sale_date: prop.lastSaleDate || prop.lastSale?.date || new Date().toISOString().split('T')[0],
      sale_price: prop.lastSalePrice || prop.lastSale?.price || 0,
      latitude: prop.latitude || null,
      longitude: prop.longitude || null,
      status: 'new',
      source: 'realestateapi'
    };
  });

  const { error } = await supabase.from('leads').insert(leadsToInsert);
  if (error) console.error(error.message);
  else console.log('Successfully inserted 3 leads with actual names!');
}
run();
