import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const company_id = "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a"; // Office Angel Dev
  const res = await fetch('https://hardhat-solutions.com/api/stripe/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id,
      customer_name: "John Doe Test",
      customer_email: "johndoe@example.com",
      customer_phone: "555-0199",
      items: [
        { desc: "Panel Upgrade", qty: 1, rate: 1500 },
        { desc: "Permit Fee", qty: 1, rate: 150 }
      ]
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
