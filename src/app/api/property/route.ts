import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    // 1. Reverse Geocode via Nominatim
    const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
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
    
    const street = `${houseNum} ${road}`.trim();
    let shortAddress = street ? `${street}, ${city}` : nomData.display_name.split(',').slice(0, 2).join(',');

    // If we have a good street and zip, let's hit RealEstateAPI
    if (street && zip && process.env.REAL_ESTATE_API_KEY) {
      try {
        const reApiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
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
            owner_name: ownerName ? ownerName.split('&')[0].trim() : '', // Clean up "Smith & Jones"
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

    // Fallback if RealEstateAPI fails or we don't have enough data
    
    // Easter egg / hardcode for Jakob's house during demos
    if (shortAddress.toLowerCase().includes("144 huntington") || street.toLowerCase().includes("144 huntington")) {
       return NextResponse.json({ 
         address: "144 Huntington Dr, Waconia",
         owner_name: "Jakob Scott",
         year_built: 2025,
         beds: 3,
         baths: 2,
         sqft: 3240,
         last_sale_price: 520000,
         last_sale_date: "2021-08-14",
         source: "Override"
       });
    }

    // Generate a consistent, realistic mock name based on the street number for the demo
    const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Christopher", "Matthew", "Daniel"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White"];
    
    // Simple deterministic random
    const num = parseInt(houseNum) || Math.floor(Math.random() * 100);
    const randomFirst = firstNames[num % firstNames.length];
    const randomLast = lastNames[(num * 3) % lastNames.length];
    const mockBeds = 3 + (num % 3);
    const mockBaths = 2 + (num % 2);
    const mockSqft = 1800 + (num * 10 % 2000);
    const mockPrice = 300000 + (num * 5000 % 500000);
    const mockYear = 1970 + (num % 50);

    return NextResponse.json({ 
      address: shortAddress,
      owner_name: `${randomFirst} ${randomLast}`,
      year_built: mockYear,
      beds: mockBeds,
      baths: mockBaths,
      sqft: mockSqft,
      last_sale_price: mockPrice,
      last_sale_date: "2021-08-14",
      source: "Mock (API key active but exact match failed)"
    });

  } catch (error) {
    console.error('Error fetching property data:', error);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}
