import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertyDetail`;
  const payload = { propertyId: "144711466" };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (data && data.data) {
     const ownerInfo = Object.entries(data.data).filter(([k, v]) => k.toLowerCase().includes('owner'));
     console.log(ownerInfo);
  }
}
run();
