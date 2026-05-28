import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Unauthorized cross-reference hit');
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Starting cross-reference between New Builds and Property Sales...');

  try {
    // 1. Fetch active builds approaching or past their completion date
    const today = new Date();
    // Look at anything where the estimated completion is older than 30 days ago up to future
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: builds, error: buildError } = await supabase
      .from('new_build_permits')
      .select('*')
      .eq('status', 'foundation') // or whatever the active status is
      .lte('estimated_completion_date', today.toISOString());

    if (buildError) throw buildError;
    if (!builds || builds.length === 0) {
      return NextResponse.json({ success: true, message: 'No builds ready for cross-reference.' });
    }

    console.log(`Found ${builds.length} builds in the Move-In Window. Checking for deed transfers...`);
    
    let convertedCount = 0;

    for (const build of builds) {
      // 2. Hit the RealEstateAPI (New Movers) to check if a deed transferred for this address
      const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
      const payload = {
        address: build.property_address,
        zip: build.zip_code || undefined,
        city: build.city || undefined,
        state: build.state || undefined
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REAL_ESTATE_API_KEY || ''
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) continue;

        const data = await response.json();
        if (!data.data || data.data.length === 0) continue;

        const property = data.data[0];
        
        // 3. Check if the last sale date is recent (meaning the builder sold it to the homeowner)
        if (property.lastSaleDate) {
          const saleDate = new Date(property.lastSaleDate);
          const permitDate = new Date(build.permit_date);
          
          // If the sale happened AFTER the permit was issued, it's the new homeowner!
          if (saleDate > permitDate) {
            console.log(`Match! Deed transferred for ${build.property_address} to ${property.owner1LastName || 'New Owner'}`);
            
            // A. Insert into 'leads' table as a hot new mover
            const { error: insertError } = await supabase.from('leads').insert([{
              company_id: build.company_id,
              property_address: build.property_address,
              city: build.city,
              state: build.state,
              zip_code: build.zip_code,
              new_owner_name: property.owner1LastName || property.owner1FullName || 'New Resident',
              sale_date: property.lastSaleDate,
              sale_price: property.lastSalePrice || property.lastSale?.price || null,
              status: 'new',
              source: 'build_converted'
            }]);

            if (!insertError) {
              // B. Update the new_build_permit status so we don't cross-reference it again
              await supabase
                .from('new_build_permits')
                .update({ status: 'moved_in', new_owner_name: property.owner1LastName || 'New Resident' })
                .eq('id', build.id);
                
              convertedCount++;
            }
          }
        }
      } catch (err) {
        console.error(`Failed to cross-reference address ${build.property_address}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      checked: builds.length, 
      converted: convertedCount 
    });

  } catch (error: any) {
    console.error("Cross-reference failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
