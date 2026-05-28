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
  console.log(response.status);
  const text = await response.text();
  console.log(text.substring(0, 300));
}
run();
