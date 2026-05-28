import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const payload = { zip: "55344", limit: 1 };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  console.log(JSON.stringify(data.data[0], null, 2));
}
run();
