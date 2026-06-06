import twilio from 'twilio';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup clients
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function onboard(companyName, areaCode) {
  try {
    console.log(`Starting onboarding for ${companyName} in area code ${areaCode}...`);

    // 1. Find a Twilio number
    console.log("Searching for available numbers...");
    const available = await twilioClient.availablePhoneNumbers('US').local.list({
      areaCode: areaCode,
      limit: 1
    });

    if (!available || available.length === 0) {
      throw new Error(`No numbers available in area code ${areaCode}`);
    }
    
    const targetNumber = available[0].phoneNumber;
    console.log(`Found number: ${targetNumber}. Purchasing...`);

    // 2. Buy the Twilio number
    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: targetNumber,
      // Point the raw Twilio webhook to your Next.js server just in case
      voiceUrl: 'https://www.office-angel.com/api/twilio-voice' 
    });
    
    console.log(`Successfully purchased ${purchased.phoneNumber}. Importing to Vapi...`);

    // 3. Import to Vapi
    const vapiRes = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'twilio',
        number: targetNumber,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        serverUrl: 'https://www.office-angel.com/api/vapi/assistant-request',
        name: `${companyName} Office Line`
      })
    });

    if (!vapiRes.ok) {
        const errBody = await vapiRes.text();
        throw new Error(`Failed to import to Vapi: ${vapiRes.status} - ${errBody}`);
    }
    const vapiData = await vapiRes.json();
    console.log(`Successfully imported to Vapi! Vapi Phone ID: ${vapiData.id}`);

    // 4. Add to Supabase
    console.log("Adding company to Supabase...");
    const { data: company, error } = await supabase.from('companies').insert({
      name: companyName,
      phone_number: targetNumber,
      ai_enabled: true
    }).select().single();

    if (error) {
      throw new Error(`Failed to insert into Supabase: ${error.message}`);
    }

    console.log(`\n✅ ONBOARDING COMPLETE!`);
    console.log(`Company ID: ${company.id}`);
    console.log(`Give the customer this number: ${targetNumber}`);
    
    return targetNumber;
  } catch (error) {
    console.error("ONBOARDING FAILED:", error);
  }
}

// Check args
const name = process.argv[2];
const area = process.argv[3];
if(name && area) {
    onboard(name, area);
} else {
    console.log("Usage: node onboard_company.mjs 'Company Name' 612");
}
