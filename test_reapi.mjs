import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const payload = { street: "11611 Raspberry Hill Rd", zip: "55344" };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REAL_ESTATE_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (data && data.data && data.data.length > 0) {
      console.log("Success! Found property.");
      console.log("Owner Name:", data.data[0].ownerName || data.data[0].owner1FullName || data.data[0].owner1LastName);
      console.log("Address:", data.data[0].address?.addressLine1);
      console.log("Beds:", data.data[0].bedrooms);
      console.log("Year Built:", data.data[0].yearBuilt);
      console.log("Square Feet:", data.data[0].squareFeet);
  } else {
      console.log("Not found or error:", data);
  }
}
run();
