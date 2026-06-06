import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://api.vapi.ai/phone-number', {
    headers: { 'Authorization': 'Bearer 2ce4ce20-6e3c-4cca-9263-dd9620d830e7' }
  });
  console.log(await res.json());
}
check();
