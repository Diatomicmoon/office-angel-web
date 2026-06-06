import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+16123245110';
const webhookUrl = 'https://www.office-angel.com/api/twilio-voice';

if (!accountSid || !authToken) {
  console.error('❌ Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function setup() {
  try {
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber });

    if (!numbers.length) {
      console.error('❌ Phone number not found in account');
      process.exit(1);
    }

    const sid = numbers[0].sid;
    console.log(`✅ Found number SID: ${sid}`);

    const updated = await client.incomingPhoneNumbers(sid).update({
      voiceUrl: webhookUrl,
      voiceMethod: 'POST',
    });

    console.log(`✅ Webhook set to: ${updated.voiceUrl}`);
    console.log(`✅ Twilio number ${phoneNumber} is now wired to Office Angel!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

setup();
