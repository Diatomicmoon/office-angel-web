const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

async function update() {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/PN0a195072b788d0dada208d6f5a7bd08b.json`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        },
        body: new URLSearchParams({
            VoiceUrl: 'https://www.hardhat-solutions.com/api/twilio-voice',
            VoiceMethod: 'POST'
        })
    });
    const data = await response.json();
    console.log(data.voice_url);
}
update();
