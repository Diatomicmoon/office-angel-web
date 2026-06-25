const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama3-8b-8192',
    });
    console.log('Success:', completion.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
run();
