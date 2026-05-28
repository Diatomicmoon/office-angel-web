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
  if (data && data.data && data.data.length > 0) {
      console.log(Object.keys(data.data[0]));
      // specifically log anything with name or owner
      const keys = Object.keys(data.data[0]).filter(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('owner'));
      console.log("Filtered keys:", keys);
      keys.forEach(k => console.log(k, ":", data.data[0][k]));
  }
}
run();
