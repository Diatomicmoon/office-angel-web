import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log("Testing Shovels.ai GraphQL Endpoint correctly...");
  const url = `https://graphql.shovels.ai/v1/graphql`; 
  
  const query = `
    query {
      permits(limit: 3, where: {zip_code: {_eq: "55344"}}) {
        address_line_1
        issued_date
        job_value
      }
    }
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SHOVELS_API_KEY}`,
      'x-hasura-admin-secret': process.env.SHOVELS_API_KEY, // Sometimes required depending on their auth setup
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response Body:", text.substring(0, 500));
}

run();
