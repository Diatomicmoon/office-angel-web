import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: 'office-angel-web/.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const payload = { zip: "55344", limit: 1 };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'OFFICEANGEL-9f43-39fe-20e0-dd95faae4c04'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log(data);
}
run();
