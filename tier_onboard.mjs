import twilio from 'twilio';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup clients
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function onboard(companyName, tier, areaCode) {
  const result = {
    companyName,
    tier,
    areaCode,
    twilioNumber: null,
    ghlStatus: 'Pending Agency API Key',
    vapiId: null,
    supabaseId: null,
    hardwarePending: tier === 3
  };

  try {
    console.error(`[Logs] Starting onboarding for ${companyName} on Tier ${tier} in area code ${areaCode}...`);

    // 1. Supabase Insertion
    console.error("[Logs] Creating Supabase record...");
    const { data: company, error } = await supabase.from('companies').insert({
      name: companyName,
      // We will map tier into the db structure, or just save it in metadata if 'tier' column doesn't exist yet
      ai_enabled: tier >= 2
    }).select().single();

    if (error) {
      // If schema mismatch, we fallback gracefully
      console.error("[Logs] Supabase warning: " + error.message);
    } else {
      result.supabaseId = company.id;
    }

    // 2. GHL Provisioning 
    // Requires Agency Level API key to dynamically generate Sub-Accounts. 
    console.error("[Logs] Mocking GHL Sub-Account creation (Waiting for Agency API Key)...");
    result.ghlStatus = 'Ready to provision (Need Agency Key)';

    // 3. Telephony & AI (Tier 2 and 3)
    if (tier >= 2) {
      console.error(`[Logs] Searching for available numbers in ${areaCode}...`);
      const available = await twilioClient.availablePhoneNumbers('US').local.list({
        areaCode: areaCode,
        limit: 1
      });

      if (!available || available.length === 0) {
        throw new Error(`No numbers available in area code ${areaCode}`);
      }
      
      const targetNumber = available[0].phoneNumber;
      result.twilioNumber = targetNumber;
      console.error(`[Logs] Found number: ${targetNumber}. Purchasing...`);

      // Buy Twilio number
      const purchased = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber: targetNumber,
        voiceUrl: 'https://www.hardhat-solutions.com/api/twilio-voice' 
      });

      // Import to Vapi
      console.error(`[Logs] Importing ${targetNumber} to Vapi...`);
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
          serverUrl: 'https://www.hardhat-solutions.com/api/vapi/assistant-request',
          name: `${companyName} Office Line`
        })
      });

      if (!vapiRes.ok) {
        const errBody = await vapiRes.text();
        throw new Error(`Failed to import to Vapi: ${vapiRes.status} - ${errBody}`);
      }
      const vapiData = await vapiRes.json();
      result.vapiId = vapiData.id;

      // Update Supabase if we got an ID earlier
      if (result.supabaseId) {
        await supabase.from('companies').update({
          phone_number: targetNumber
        }).eq('id', result.supabaseId);
      }
    }

    console.error(`[Logs] ✅ ONBOARDING COMPLETE!`);
    
    // Send structured JSON to stdout for OpenClaw to parse
    console.log(JSON.stringify({ status: "success", data: result }));

  } catch (error) {
    console.error("[Logs] ONBOARDING FAILED:", error);
    console.log(JSON.stringify({ status: "error", error: error.message, partialData: result }));
  }
}

// Check args
const name = process.argv[2];
const tier = parseInt(process.argv[3] || "1", 10);
const area = process.argv[4] || "612"; // default

if(name && tier) {
    onboard(name, tier, area);
} else {
    console.log(JSON.stringify({ status: "error", error: "Usage: node tier_onboard.mjs 'Company Name' <Tier> <AreaCode>" }));
}