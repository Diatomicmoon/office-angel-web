import { NextResponse } from 'next/server';

// This is a stub for property owner lookups.
// Real implementation requires a paid real estate API like Estated, DataTree, ATTOM Data, or county public records scraping.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    // Mocking the API response for now since we don't have a paid property API key injected
    // In a real scenario, we would use the address or lat/lng to query a parcel/deed API.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo purposes, generate a random realistic-sounding name if the address exists
    const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // If we have an address, use a hash of it to keep the random name consistent for the same house
    let ownerName = `${randomFirst} ${randomLast}`;
    let isMock = true;

    return NextResponse.json({ 
      owner_name: ownerName,
      last_sale_date: "2021-08-14",
      last_sale_price: 345000,
      year_built: 1998,
      source: "Mock Data (API Key Required)",
      is_mock: isMock
    });

  } catch (error) {
    console.error('Error fetching property data:', error);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}
