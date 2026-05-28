import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log("Testing Shovels.ai API...");
  // Hitting their building-permits endpoint for Eden Prairie zip code
  // Using REST instead of GraphQL for the simple test
  const url = `https://api.shovels.ai/v1/building-permits?zip=55344&permit_type=NEW_CONSTRUCTION&limit=3`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.SHOVELS_API_KEY}`,
      'Accept': 'application/json'
    }
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response Body:", text.substring(0, 500));
}

run();
