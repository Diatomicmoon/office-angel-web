import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=44.8548&lon=-93.4707`, {
      headers: { 'User-Agent': 'OfficeAngel/1.0' }
  });
  const nomData = await nomRes.json();
  const houseNum = nomData.address?.house_number || '';
  const road = nomData.address?.road || '';
  const zip = nomData.address?.postcode || '';
  const street = `${houseNum} ${road}`.trim();
  
  console.log("Street:", street, "Zip:", zip);
  
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
      console.log("Owner Name:", reData.data[0].ownerName || reData.data[0].owner1FullName || reData.data[0].owner1LastName);
      console.log("Year:", reData.data[0].yearBuilt);
  } else {
      console.log("Not found in RE API", reData);
  }
}
run();
