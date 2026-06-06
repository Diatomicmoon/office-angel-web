import fetch from 'node-fetch';

async function update() {
  const payload = {
    server: {
      url: 'https://www.office-angel.com/api/call-finished',
      timeoutSeconds: 20
    }
  };
  
  const res = await fetch(`https://api.vapi.ai/assistant/8cfc6769-5f94-4d61-923e-082557d82fde`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer 2ce4ce20-6e3c-4cca-9263-dd9620d830e7`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Assistant Webhook Update:", res.status);
}
update();
