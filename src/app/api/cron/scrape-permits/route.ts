import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder');
  console.log('Starting nightly PERMIT scrape...');

  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (!companies || companies.length === 0) throw new Error('No company');
    const companyId = companies[0]?.id;

    const targetZips = ['55344', '55347', '55343', '55441', '55305']; 
    let totalInserted = 0;

    for (const zip of targetZips) {
      if (!process.env.SHOVELS_API_KEY) {
         console.log("No SHOVELS_API_KEY found, skipping permit scrape.");
         return NextResponse.json({ success: false, message: "Missing SHOVELS_API_KEY" });
      }

      const url = `https://api.shovels.ai/v1/permits?zip=${zip}&type=new_construction&limit=50`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.SHOVELS_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (!data.results || data.results.length === 0) continue;

      const permitsToInsert = data.results.map((permit: any) => {
        // Calculate estimated completion (6 months from permit date)
        const permitDate = new Date(permit.issued_date || Date.now());
        const estimatedCompletion = new Date(permitDate);
        estimatedCompletion.setMonth(estimatedCompletion.getMonth() + 6);

        return {
          company_id: companyId,
          property_address: permit.address?.street || 'Unknown',
          city: permit.address?.city || '',
          state: permit.address?.state || '',
          zip_code: zip,
          contractor_name: permit.contractor?.name || 'Unknown Builder',
          contractor_phone: permit.contractor?.phone || null,
          permit_date: permitDate.toISOString().split('T')[0],
          estimated_completion_date: estimatedCompletion.toISOString().split('T')[0],
          status: 'foundation',
          latitude: permit.latitude || null,
          longitude: permit.longitude || null
        };
      });

      const { error } = await supabase.from('new_build_permits').insert(permitsToInsert);
      if (!error) totalInserted += permitsToInsert.length;
    }

    return NextResponse.json({ success: true, inserted: totalInserted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
