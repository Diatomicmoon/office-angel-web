import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function runTest() {
  console.log("Simulating an incoming permit email webhook from SendGrid/Twilio...");

  // We have a hardcoded fallback or we can use the actual office angel company ID if we pass it via the 'to' email address
  // Let's check what the route uses as a fallback if no ID is found in the email address.
  // It looks at process.env.OFFICE_ANGEL_COMPANY_ID, or defaults to the first company.

  // Let's simulate a SendGrid multipart/form-data payload or just JSON if the route accepts it.
  // The route.ts seems to process FormData. We need to construct a FormData payload.
  
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('from', 'Inspections <epermits@minneapolismn.gov>');
  form.append('to', 'inbox@tradevolt.ai');
  form.append('subject', 'Permit Approved: M-1234567 - 1552 Sierra Way');
  form.append('text', 'Your electrical permit M-1234567 for 1552 Sierra Way has been approved. The fee of $150.00 has been processed successfully. Please print this email for your records and post it on the job site.');

  // Since we are running this script locally, we need to hit the local dev server or production.
  // Let's hit the actual endpoint directly using our own logic, or if the dev server is not running, we'll hit the production URL.
  
  const url = 'https://office-angel.vercel.app/api/inbound-email';
  console.log(`Sending to ${url}...`);

  const response = await fetch(url, {
    method: 'POST',
    body: form
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response Body:", text);
}
runTest();
