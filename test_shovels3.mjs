import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log("Testing Shovels.ai API Base Endpoint...");
  // Sometimes they use a different base URL for the actual data requests vs auth
  const url = `https://api.shovels.ai/v1/permits`; 
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'shovels-api-key': process.env.SHOVELS_API_KEY,
      'Accept': 'application/json'
    }
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response Body:", text.substring(0, 500));
}

run();
