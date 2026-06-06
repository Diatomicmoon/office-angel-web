import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const res = await fetch(`https://api.vapi.ai/assistant/${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}`, {
    headers: { 'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}` }
  });
  const data = await res.json();
  console.log("Vapi Assistant Tools:", JSON.stringify(data.model?.tools || data.tools || [], null, 2));
  console.log("Vapi Transfer Destinations:", JSON.stringify(data.transferDestinations || "none", null, 2));
}
run();
