import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    // 1. Try to find the closest property in our Hennepin Parcels table
    const offset = 0.0003; // ~30 meters (tighter snap to avoid grabbing the neighbor)
    const { data: parcels } = await supabase
      .from('hennepin_parcels')
      .select('*')
      .gte('latitude', lat - offset)
      .lte('latitude', lat + offset)
      .gte('longitude', lng - offset)
      .lte('longitude', lng + offset);

    if (parcels && parcels.length > 0) {
      let closest = parcels[0];
      let minDistance = Infinity;

      for (const p of parcels) {
        const dLat = p.latitude - lat;
        const dLng = p.longitude - lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = p;
        }
      }

      return NextResponse.json({
        address: closest.address + (closest.city ? `, ${closest.city}` : ''),
        owner_name: closest.owner_name,
        year_built: closest.build_yr,
        beds: null,
        baths: null,
        sqft: closest.sqft,
        last_sale_price: closest.last_sale_price,
        last_sale_date: closest.last_sale_date,
        source: 'Hennepin County Database'
      });
    }

    // 2. Fallback to Reverse Geocode via Nominatim if no parcel is found
    const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'User-Agent': 'HardHatSolutions/1.0' }
    });
    const nomData = await nomRes.json();
    
    if (!nomData || !nomData.address) {
       return NextResponse.json({ error: "Could not geocode location", address: "Unknown Location" }, { status: 404 });
    }

    const houseNum = nomData.address.house_number || '';
    const road = nomData.address.road || '';
    let shortAddress = `${houseNum} ${road}`.trim() || nomData.display_name.split(',').slice(0, 2).join(',');

    // 3. Fallback to Text Search in Database (handles records with null lat/lng like Carver County)
    if (houseNum && road) {
      const roadName = road.replace(/ (Ave|Drive|Dr|St|Street|Rd|Road|Ln|Lane|Blvd|Cir|Ct|Trl|Way|Pl|Sq|Pass|Path|Run).*$/i, '').trim(); // e.g. "Huntington" from "Huntington Drive"
      const searchStr = `${houseNum}%${roadName}%`; console.log('Searching:', searchStr);
      
      const { data: textMatch } = await supabase
        .from('hennepin_parcels')
        .select('*')
        .ilike('address', searchStr)
        .limit(1);

      if (textMatch && textMatch.length > 0) {
        const closest = textMatch[0];
        
        // Auto-geocode it for the future!
        await supabase
          .from('hennepin_parcels')
          .update({ latitude: lat, longitude: lng })
          .eq('id', closest.id);

        return NextResponse.json({
          address: closest.address + (closest.city ? `, ${closest.city}` : ''),
          owner_name: closest.owner_name,
          year_built: closest.build_yr,
          beds: null,
          baths: null,
          sqft: closest.sqft,
          last_sale_price: closest.last_sale_price,
          last_sale_date: closest.last_sale_date,
          source: 'County Tax DB (Text Match)'
        });
      }
    }

    // 4. Ultimate Fallback (No record in DB)
    return NextResponse.json({ 
      address: shortAddress,
      owner_name: `Unknown`,
      year_built: null,
      beds: null,
      baths: null,
      sqft: null,
      last_sale_price: null,
      last_sale_date: null,
      source: "County Tax DB (No exact match found)"
    });

  } catch (error) {
    console.error('Error fetching property data:', error);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}