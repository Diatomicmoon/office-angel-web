import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // CRON IS TEMPORARILY PAUSED TO SAVE API CREDITS
  // Uncomment the rest of the function when Christian is ready to use it
  console.log('Cron paused to save credits.');
  return NextResponse.json({ success: true, message: "Scraper paused to save API credits." });

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For local testing without headers, we can bypass this if needed, but keeping it secure
    console.log('Unauthorized cron hit');
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Starting nightly lead scrape...');

  try {
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (companyError || !companies || companies?.length === 0) {
      throw new Error('Could not find company to assign leads to.');
    }

    const companyId = companies?.[0]?.id;
    const targetZips = ['55344', '55347', '55343']; 
    let totalInserted = 0;

    // We want homes sold in the last 14 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    for (const zip of targetZips) {
      console.log(`Scraping zip: ${zip}`);
      
      const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
      
      // Pulling the latest 100 properties in the zip
      const payload = {
        zip: zip,
        limit: 10 // Reduced to 10 to save API credits 
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REAL_ESTATE_API_KEY || ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`Failed to fetch for zip ${zip}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        continue;
      }

      // Filter in memory for recent sales
      const recentSales = data.data.filter((prop: any) => {
        if (!prop.lastSaleDate) return false;
        const saleDate = new Date(prop.lastSaleDate);
        return saleDate >= cutoffDate;
      });

      if (recentSales.length === 0) {
        console.log(`No recent sales found in ${zip} out of ${data.data.length} records.`);
        continue;
      }

      console.log(`Found ${recentSales.length} recent sales in ${zip}!`);

      const leadsToInsert = recentSales.map((prop: any) => ({
        company_id: companyId,
        property_address: prop.address?.street || prop.address?.address || 'Unknown',
        city: prop.address?.city || '',
        state: prop.address?.state || '',
        zip_code: prop.address?.zip || zip,
        new_owner_name: prop.owner1LastName || 'Current Resident',
        sale_date: prop.lastSaleDate || null,
        sale_price: prop.lastSalePrice || prop.lastSale?.price || null,
        latitude: prop.latitude || null,
        longitude: prop.longitude || null,
        status: 'new',
        source: 'realestateapi'
      }));

      const { error: insertError } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (insertError) {
        console.error('Error inserting leads:', insertError);
      } else {
        totalInserted += leadsToInsert.length;
      }
    }

    console.log(`Scrape complete. Inserted ${totalInserted} new leads.`);
    
    return NextResponse.json({ 
      success: true, 
      inserted: totalInserted
    });

  } catch (error: any) {
    console.error('Scraper error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
