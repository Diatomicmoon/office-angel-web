import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production.local' });

async function check() {
  const res = await fetch('https://api.vapi.ai/logs', {
    headers: { 'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}` }
  });
  const data = JSON.parse(await res.text());
  const webhooks = (data.results || []).filter(r => r.type === 'Webhook');
  for (const w of webhooks.slice(0, 10)) {
     console.log(`${w.webhookType} -> ${w.requestUrl} [HTTP ${w.responseHttpCode}]`);
  }
}
check();
