import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const res = await fetch('https://api.vapi.ai/phone-number', {
    headers: { 'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}` }
  });
  const data = await res.json();
  console.log("Vapi Numbers:", data.map(n => n.number));
}
run();
