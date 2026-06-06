import fs from 'fs';

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

    // 2. Last resort Mock Data
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
