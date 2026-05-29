import fetch from 'node-fetch';

async function runTest() {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('from', 'Inspections <epermits@minneapolismn.gov>');
  form.append('to', 'inbox@tradevolt.ai');
  form.append('subject', 'Permit Approved: M-1234567 - 1552 Sierra Way');
  form.append('text', 'Your electrical permit M-1234567 for 1552 Sierra Way has been approved. The fee of $150.00 has been processed successfully. Please print this email for your records and post it on the job site.');

  const url = 'http://localhost:3000/api/inbound-email';
  console.log(`Sending to ${url}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: form
    });
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response Body:", text);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

// wait a few seconds for the dev server to boot
setTimeout(runTest, 3000);
