import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production.local' });

async function checkLogs() {
  const res = await fetch('https://api.vapi.ai/logs', {
    headers: { 'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}` }
  });
  const text = await res.text();
  try {
     const data = JSON.parse(text);
     const webhooks = (data.results || []).filter(r => r.type === 'Webhook' && r.webhookType === 'Tool Call');
     if (webhooks.length > 0) {
        console.log("Latest Tool Call:");
        const payload = JSON.parse(webhooks[0].requestBody);
        console.log(JSON.stringify(payload.message.toolCalls, null, 2));
        console.log("Response Code:", webhooks[0].responseHttpCode);
     } else {
        console.log("No tool calls found yet.");
     }
  } catch (e) {
     console.log(text.substring(0, 500));
  }
}
checkLogs();
