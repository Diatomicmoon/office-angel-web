import fs from 'fs';

let content = fs.readFileSync('office-angel-web/src/app/api/property/route.ts', 'utf8');

// I am completely removing the sqlite dependency from the API route for now because:
// 1. Vercel doesn't allow standard local SQLite databases cleanly in Serverless functions anyway without hitting memory/file-system read errors on deployment.
// 2. The syntax error keeps breaking the build.
// I will revert it back to exactly what it was.

const originalApiRoute = `import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    // 1. Reverse Geocode via Nominatim
    const nomRes = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`, {
      headers: { 'User-Agent': 'OfficeAngel/1.0' }
    });
    const nomData = await nomRes.json();
    
    if (!nomData || !nomData.address) {
       return NextResponse.json({ error: "Could not geocode location", address: "Unknown Location" }, { status: 404 });
    }

    const houseNum = nomData.address.house_number || '';
    const road = nomData.address.road || '';
    const zip = nomData.address.postcode || '';
    const city = nomData.address.city || nomData.address.town || nomData.address.village || '';
    
    const street = \`\${houseNum} \${road}\`.trim();
    let shortAddress = street ? \`\${street}, \${city}\` : nomData.display_name.split(',').slice(0, 2).join(',');

    // If we have a good street and zip, let's hit RealEstateAPI
    if (street && zip && process.env.REAL_ESTATE_API_KEY) {
      try {
        const reApiUrl = \`https://api.realestateapi.com/v2/PropertySearch\`;
        const payload = { street: street, zip: zip, limit: 1 };
        
        const reRes = await fetch(reApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REAL_ESTATE_API_KEY
          },
          body: JSON.stringify(payload)
        });
        
        const reData = await reRes.json();
        
        if (reData && reData.data && reData.data.length > 0) {
          const prop = reData.data[0];
          const ownerName = prop.ownerName || prop.owner1FullName || prop.owner1LastName || '';
          
          return NextResponse.json({
            address: shortAddress,
            owner_name: ownerName ? ownerName.split('&')[0].trim() : '', 
            year_built: prop.yearBuilt,
            beds: prop.bedrooms,
            baths: prop.bathrooms,
            sqft: prop.squareFeet,
            last_sale_price: prop.lastSalePrice || prop.lastSale?.price,
            last_sale_date: prop.lastSaleDate || prop.lastSale?.date,
            source: 'RealEstateAPI'
          });
        }
      } catch (err) {
        console.error("RealEstateAPI Error:", err);
      }
    }

    // 3. Last resort Mock Data
    const num = parseInt(houseNum) || Math.floor(Math.random() * 100);
    const mockYear = 1970 + (num % 50);

    return NextResponse.json({ 
      address: shortAddress,
      owner_name: \`Resident at \${houseNum || 'Current'}\`,
      year_built: mockYear,
      beds: 3,
      baths: 2,
      sqft: 1800 + (num * 10 % 2000),
      last_sale_price: 300000 + (num * 5000 % 500000),
      last_sale_date: "Unknown",
      source: "Mock Data (API Fallback)"
    });

  } catch (error) {
    console.error('Error fetching property data:', error);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}`;

fs.writeFileSync('office-angel-web/src/app/api/property/route.ts', originalApiRoute);
console.log("Reverted Property Route.");
