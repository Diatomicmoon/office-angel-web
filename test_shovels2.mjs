import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function run() {
  const url = `https://api.shovels.ai/v1/permits?zip=55344&type=new_construction&limit=3`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${process.env.SHOVELS_API_KEY}`, 'Accept': 'application/json' } });
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response Body:", text.substring(0, 500));
}
run();
