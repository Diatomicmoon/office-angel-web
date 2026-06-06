import fetch from 'node-fetch';

async function check() {
  const res = await fetch('https://api.vapi.ai/org', {
    headers: { 'Authorization': 'Bearer 7d68e734-73d7-463d-815c-dc8c55dc28a6' }
  });
  console.log(await res.json());
}
check();
