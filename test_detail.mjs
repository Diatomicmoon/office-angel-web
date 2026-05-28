import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertyDetail`;
  // Using propertyId from earlier log for 8736 Leeward Cir
  const payload = { propertyId: "144711466" };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.REAL_ESTATE_API_KEY },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (data && data.data && data.data.owner) {
      console.log("Found Owner Object:", data.data.owner);
  } else {
      console.log("No owner object found in PropertyDetail either.");
      // Dump keys to see what we have
      if (data.data) {
          const keys = Object.keys(data.data).filter(k => k.toLowerCase().includes('owner'));
          console.log("Owner related keys:", keys);
          keys.forEach(k => console.log(k, data.data[k]));
      }
  }
}
run();
