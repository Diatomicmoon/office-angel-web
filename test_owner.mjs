import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const apiUrl = `https://api.realestateapi.com/v2/PropertySearch`;
  const payload = { zip: "55344", limit: 3 };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REAL_ESTATE_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  if(data && data.data) {
     data.data.forEach((prop, index) => {
        console.log(`\n--- Property ${index + 1} ---`);
        console.log("Address:", prop.address?.addressLine1 || prop.address?.street);
        
        // Let's log every possible place the name could be hiding
        console.log("owner1FullName:", prop.owner1FullName);
        console.log("owner1LastName:", prop.owner1LastName);
        console.log("ownerName:", prop.ownerName);
        console.log("prop.owner object:", prop.owner);
     });
  }
}

run();
