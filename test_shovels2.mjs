import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  console.log("Testing Shovels.ai API GraphQL...");
  
  const query = `
    query {
      permits(
        first: 3, 
        where: { zip_code: { _eq: "55344" } }
      ) {
        edges {
          node {
            id
            address { street city state zip_code }
            description
            permit_type
            issued_date
          }
        }
      }
    }
  `;

  const url = `https://api.shovels.ai/graphql`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SHOVELS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response Body:", text.substring(0, 500));
}

run();
