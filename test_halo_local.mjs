import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function test() {
  const url = 'http://localhost:3000/api/halo';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Where is John?' }] })
  });
  console.log(response.status);
  console.log(await response.text());
}
test();
