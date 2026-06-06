import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production.local' });

async function check() {
  try {
    const res = await fetch(`https://api.vapi.ai/assistant/8cfc6769-5f94-4d61-923e-082557d82fde`, {
      headers: { 'Authorization': `Bearer 2ce4ce20-6e3c-4cca-9263-dd9620d830e7` }
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
check();
